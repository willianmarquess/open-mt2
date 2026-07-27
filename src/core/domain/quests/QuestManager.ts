import * as fs from 'node:fs';
import * as path from 'node:path';
import Logger from '@/core/infra/logger/Logger';
import { AbstractQuest } from './AbstractQuest';
import { getQuestMeta, QuestStatusEnum } from './decorators/QuestDecorator';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import Player from '../entities/game/player/Player';
import NPC from '../entities/game/mob/NPC';
import { NpcQuest } from './facade/NpcQuest';
import { VictimQuest } from './facade/VictimQuest';
import Monster from '../entities/game/mob/Monster';
import ShopManager from '@/core/domain/shop/ShopManager';

export class QuestManager {
    private readonly logger: Logger;
    private readonly shopManager: ShopManager;
    private readonly containerInstance: any;
    private readonly questsClasses: Map<number, typeof AbstractQuest> = new Map();
    private readonly questsClickEvents: Map<number, Map<number, Set<string>>> = new Map();
    private readonly eventQuestMap: Map<QuestEventEnum, Map<number, Set<string>>> = new Map();

    constructor({
        logger,
        shopManager,
        containerInstance,
    }: {
        logger: Logger;
        shopManager: ShopManager;
        containerInstance: any;
    }) {
        this.logger = logger;
        this.shopManager = shopManager;
        this.containerInstance = containerInstance;
    }

    load() {
        const baseDir = path.join(process.cwd(), 'src', 'core', 'domain', 'quests', 'quests');

        if (!fs.existsSync(baseDir)) {
            this.logger.error(`[QUEST_MANAGER]: directory not found: ${baseDir}`);
            return;
        }

        const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of files) {
            try {
                this.loadQuestFile(baseDir, file);
            } catch (err) {
                this.logger.error(`[QUEST_MANAGER] Failed to load quest file ${file}: ${(err as Error).message}`);
            }
        }

        this.logger.info(`[QUEST_MANAGER] Loaded ${this.questsClasses.size} quests`);
    }

    private loadQuestFile(baseDir: string, file: string) {
        const fullPath = path.join(baseDir, file);

        delete require.cache[require.resolve(fullPath)];
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require(fullPath);

        for (const exp of Object.values(mod)) {
            if (this.isQuestClass(exp)) {
                this.registerQuestClass(exp, file);
            }
        }
    }

    private registerQuestClass(exp: unknown, file: string) {
        const ctor: any = exp;
        const meta = getQuestMeta(ctor);
        const id = meta!.id;

        if (this.questsClasses.has(id)) {
            throw new Error(`[QuestManager] Quest class name should be unique, duplicated key: ${id}`);
        }

        this.questsClasses.set(id, ctor);

        if (meta?.states) {
            for (const [, metaState] of meta.states) {
                for (const t of metaState.tasks) {
                    this.registerTask(id, metaState.name, t);
                }
            }
        }

        this.logger.info(`[QUEST_MANAGER] Loaded quest ${file} as id=${id}`);
    }

    private static readonly SIMPLE_TASK_EVENTS: ReadonlySet<QuestEventEnum> = new Set([
        QuestEventEnum.LOGIN,
        QuestEventEnum.LOGOUT,
        QuestEventEnum.LEVELUP,
        QuestEventEnum.BUTTON,
        QuestEventEnum.INFO,
        QuestEventEnum.CHAT,
        QuestEventEnum.ATTR_IN,
        QuestEventEnum.ATTR_OUT,
        QuestEventEnum.ITEM_USE,
        QuestEventEnum.SERVER_TIMER,
        QuestEventEnum.ENTER_STATE,
        QuestEventEnum.LEAVE_STATE,
        QuestEventEnum.KILL,
    ]);

    private registerTask(questId: number, stateName: string, task: { when: QuestEventEnum; target?: unknown }) {
        if (task.when === QuestEventEnum.CLICK) {
            this.registerClickTask(questId, stateName, task.target as number | number[] | undefined);
            return;
        }

        if (QuestManager.SIMPLE_TASK_EVENTS.has(task.when)) {
            this.addQuestToEvent(task.when, questId, stateName);
        }
    }

    private registerClickTask(questId: number, stateName: string, target: number | number[] | undefined) {
        if (target === undefined) {
            this.addQuestToEvent(QuestEventEnum.CLICK, questId, stateName);
            return;
        }

        for (const targetId of [target].flat()) {
            let stateMap = this.questsClickEvents.get(targetId);
            if (!stateMap) {
                stateMap = new Map<number, Set<string>>();
                this.questsClickEvents.set(targetId, stateMap);
            }

            let set = stateMap.get(questId);
            if (!set) {
                set = new Set<string>();
                stateMap.set(questId, set);
            }

            set.add(stateName);
        }
    }

    private addQuestToEvent(event: QuestEventEnum, questId: number, stateName: string) {
        let questMap = this.eventQuestMap.get(event);
        if (!questMap) {
            questMap = new Map<number, Set<string>>();
            this.eventQuestMap.set(event, questMap);
        }

        let set = questMap.get(questId);
        if (!set) {
            set = new Set<string>();
            questMap.set(questId, set);
        }

        set.add(stateName);
    }

    private getQuestsForEvent(event: QuestEventEnum): Map<number, Set<string>> {
        return this.eventQuestMap.get(event) ?? new Map<number, Set<string>>();
    }

    private isQuestClass(candidate: any): boolean {
        if (typeof candidate !== 'function') return false;
        let proto = candidate.prototype;
        while (proto) {
            if (proto === AbstractQuest.prototype) return true;
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }

    async addQuests(player: Player): Promise<void> {
        for (const [id, questClass] of this.questsClasses) {
            const ctor: any = questClass;
            const meta = getQuestMeta(ctor);

            const instance: AbstractQuest = new (questClass as any)({
                player,
                entityManager: this.containerInstance.cradle.entityManager,
                questTargetManager: this.containerInstance.cradle.questTargetManager,
            });
            (instance as any).id = meta?.id ?? id;
            (instance as any).name = meta?.name ?? id;

            if (meta?.states) {
                for (const [stateName, metaState] of meta.states) {
                    const tasks = metaState.tasks.map((t: any) => {
                        const handler = (instance as any)[t.handlerName];
                        const callback =
                            typeof handler === 'function'
                                ? handler.bind(instance)
                                : () => {
                                      console.warn(`[QUEST_MANAGER] handler not found: ${t.handlerName}`);
                                  };
                        const task: any = { when: t.when, with: t.with, callback };
                        if (t.target !== undefined) task.target = t.target;
                        return task;
                    });

                    instance.addState({ name: stateName, tasks });
                }
            }
            await instance.setState(meta!.initialState);
            player.addQuest(id, instance);
        }
    }

    async onLogin(player: Player) {
        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} logged in with running quest ${player.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        const questMap = this.getQuestsForEvent(QuestEventEnum.LOGIN);
        for (const [questId, states] of questMap) {
            const quest = player.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                await quest.runState({ eventType: QuestEventEnum.LOGIN });
            }
        }
    }

    async onLevelUp(player: Player) {
        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} logged in with running quest ${player.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        const questMap = this.getQuestsForEvent(QuestEventEnum.LEVELUP);
        for (const [questId, states] of questMap) {
            const quest = player.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                await quest.runState({ eventType: QuestEventEnum.LEVELUP });
            }
        }
    }

    onAnswer(player: Player, answer: number) {
        if (answer <= 250) {
            const quest = player.getQuestByStatus(QuestStatusEnum.SELECT);

            if (!quest) {
                this.logger.error(`[QUEST_MANAGER] No active quest awaiting select, playerId: ${player.getId()}`);
                return;
            }

            quest.unselect(answer);
        } else {
            // Values above 250 come from the [NEXT] button or from the player
            // closing the quest window. Release whatever the quest is waiting on —
            // otherwise a quest left in SELECT stays running forever and blocks
            // every further NPC interaction for this player.
            const pausedQuest = player.getQuestByStatus(QuestStatusEnum.PAUSE);
            if (pausedQuest) {
                pausedQuest.unpause();
                return;
            }

            const selectQuest = player.getQuestByStatus(QuestStatusEnum.SELECT);
            if (selectQuest) {
                selectQuest.cancel();
                return;
            }

            this.logger.error(`[QUEST_MANAGER] No active quest paused or awaiting select, playerId: ${player.getId()}`);
        }
    }

    async onClick(player: Player, npc: NPC) {
        if (!npc.isNPC()) {
            return false;
        }

        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} clicked an NPC while quest ${player.getCurrentQuest()?.getName()} is running`,
            );
            return false;
        }

        const questsMap = this.questsClickEvents.get(npc.getId()) ?? this.getQuestsForEvent(QuestEventEnum.CLICK);
        let hasExecuted: boolean = false;
        for (const [questId, states] of questsMap) {
            const quest = player.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                // Dispatch detached: the quest may suspend on a dialog answer, and
                // awaiting it here would keep the click handler (and its corked
                // socket) alive until the player replies, interleaving quest and
                // shop packets. run() marks the quest busy synchronously so a
                // second click is still rejected above.
                quest.run({
                    eventType: QuestEventEnum.CLICK,
                    npc: new NpcQuest({ npc, shopManager: this.shopManager, player }),
                });
                hasExecuted = true;
            }
        }

        return hasExecuted;
    }

    async onButton(player: Player, questId: number) {
        const event: QuestEventEnum = questId & 0x80000000 ? QuestEventEnum.INFO : QuestEventEnum.BUTTON;

        const questMap = this.getQuestsForEvent(event);
        if (!questMap) return;
        const states = questMap.get(questId & 0x7fffffff);
        if (!states) return;
        const quest = player.getQuest(questId & 0x7fffffff);
        if (!quest) return;
        const current = quest.getCurrentState()?.name;
        if (states.has(current ?? '')) {
            await quest.runState({ eventType: event });
        }
    }

    async onKill(killer: Player, victim: Player | Monster) {
        if (killer.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${killer.getId()} logged in with running quest ${killer.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        const questMap = this.getQuestsForEvent(QuestEventEnum.KILL);
        for (const [questId, states] of questMap) {
            const quest = killer.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                await quest.runState({ eventType: QuestEventEnum.KILL, victim: new VictimQuest({ victim }) });
            }
        }
    }
}
