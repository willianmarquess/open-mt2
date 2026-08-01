import * as fs from 'node:fs';
import * as path from 'node:path';
import Logger from '@/core/infra/logger/Logger';
import { AbstractQuest } from './AbstractQuest';
import { getQuestMeta, MetaTask, QuestStatusEnum, StateExecutionContextBase } from './decorators/QuestDecorator';

type TaskTarget = number | number[] | undefined;
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { QuestSkinEnum } from '@/core/enum/QuestSkinEnum';
import Player from '../entities/game/player/Player';
import NPC from '../entities/game/mob/NPC';
import { NpcQuest } from './facade/NpcQuest';
import { VictimQuest } from './facade/VictimQuest';
import Monster from '../entities/game/mob/Monster';
import ShopManager from '@/core/domain/shop/ShopManager';
import ItemManager from '../manager/ItemManager';
import { PlayerQuest } from './facade/PlayerQuest';

type ChatOption = {
    questId: number;
    stateName: string;
    label: string;
    handlerName: string;
    with?: (args: any) => boolean | Promise<boolean>;
    npc?: NPC;
};

export class QuestManager {
    private readonly logger: Logger;
    private readonly shopManager: ShopManager;
    private readonly itemManager: ItemManager;
    private readonly containerInstance: any;
    private readonly questsClasses: Map<number, typeof AbstractQuest> = new Map();
    private readonly questsClickEvents: Map<number, Map<number, Set<string>>> = new Map();
    private readonly eventQuestMap: Map<QuestEventEnum, Map<number, Set<string>>> = new Map();
    private readonly questsChatEvents: Map<number, ChatOption[]> = new Map();
    private readonly pendingChatOptions: Map<number, ChatOption[]> = new Map();

    constructor({
        logger,
        shopManager,
        itemManager,
        containerInstance,
    }: {
        logger: Logger;
        shopManager: ShopManager;
        itemManager: ItemManager;
        containerInstance: any;
    }) {
        this.logger = logger;
        this.shopManager = shopManager;
        this.itemManager = itemManager;
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
        QuestEventEnum.ATTR_IN,
        QuestEventEnum.ATTR_OUT,
        QuestEventEnum.ITEM_USE,
        QuestEventEnum.SERVER_TIMER,
        QuestEventEnum.ENTER_STATE,
        QuestEventEnum.LEAVE_STATE,
        QuestEventEnum.KILL,
    ]);

    private registerTask(questId: number, stateName: string, task: MetaTask) {
        if (task.when === QuestEventEnum.CLICK) {
            this.registerClickTask(questId, stateName, task.target as TaskTarget);
            return;
        }

        if (task.when === QuestEventEnum.CHAT) {
            this.registerChatTask(questId, stateName, task);
            return;
        }

        if (QuestManager.SIMPLE_TASK_EVENTS.has(task.when)) {
            this.addQuestToEvent(task.when, questId, stateName);
        }
    }

    /**
     * A CHAT task with a target + chat label becomes an NPC dialog menu option
     * (e.g. the Stable Boy's "Train a Horse"); without them it behaves like a
     * plain chat-event subscription.
     */
    private registerChatTask(questId: number, stateName: string, task: MetaTask) {
        const target = task.target as TaskTarget;

        if (target !== undefined && task.chat) {
            for (const targetId of [target].flat()) {
                const options = this.questsChatEvents.get(targetId) ?? [];
                options.push({
                    questId,
                    stateName,
                    label: task.chat,
                    handlerName: task.handlerName,
                    with: task.with,
                });
                this.questsChatEvents.set(targetId, options);
            }
            return;
        }

        this.addQuestToEvent(QuestEventEnum.CHAT, questId, stateName);
    }

    private registerClickTask(questId: number, stateName: string, target: TaskTarget) {
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
                itemManager: this.itemManager,
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
                        const task: any = { when: t.when, with: t.with, callback, handlerName: t.handlerName };
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

    private async dispatchStateEvent(player: Player, context: StateExecutionContextBase) {
        const questMap = this.getQuestsForEvent(context.eventType);
        for (const [questId, states] of questMap) {
            const quest = player.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                await quest.runState(context);
            }
        }
    }

    async onLogin(player: Player) {
        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} logged in with running quest ${player.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        await this.dispatchStateEvent(player, { eventType: QuestEventEnum.LOGIN });
    }

    onDespawn(player: Player) {
        this.pendingChatOptions.delete(player.getId());
    }

    async onLogout(player: Player) {
        this.onDespawn(player);
        await this.dispatchStateEvent(player, { eventType: QuestEventEnum.LOGOUT });
    }

    async onLevelUp(player: Player) {
        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} logged in with running quest ${player.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        await this.dispatchStateEvent(player, { eventType: QuestEventEnum.LEVELUP });
    }

    onAnswer(player: Player, answer: number) {
        const chatOptions = this.pendingChatOptions.get(player.getId());
        this.pendingChatOptions.delete(player.getId());

        if (chatOptions && !this.hasSuspendedQuest(player)) {
            const option = chatOptions[answer];
            if (!option) {
                player.sendQuestScript(QuestSkinEnum.NO_WINDOW, '[DONE]');
                return;
            }

            const quest = player.getQuest(option.questId);
            if (quest && quest.getCurrentState()?.name === option.stateName) {
                quest.run(
                    {
                        eventType: QuestEventEnum.CHAT,
                        npc: new NpcQuest({
                            npc: option.npc!,
                            shopManager: this.shopManager,
                            player,
                        }),
                    } as any,
                    option.handlerName,
                );
            }
            return;
        }

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

    private hasSuspendedQuest(player: Player): boolean {
        return Boolean(
            player.getQuestByStatus(QuestStatusEnum.SELECT) ?? player.getQuestByStatus(QuestStatusEnum.PAUSE),
        );
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

        const chatOptions = [] as ChatOption[];
        for (const option of this.questsChatEvents.get(npc.getId()) ?? []) {
            const quest = player.getQuest(option.questId);
            if (!quest || quest.getCurrentState()?.name !== option.stateName) continue;
            const context = {
                player: new PlayerQuest({ player }),
                npc: new NpcQuest({ npc, shopManager: this.shopManager, player }),
                eventType: QuestEventEnum.CHAT,
            };
            if (!option.with || (await option.with(context))) chatOptions.push(option);
        }

        if (chatOptions.length > 0) {
            this.pendingChatOptions.set(
                player.getId(),
                chatOptions.map((option) => ({ ...option, npc })),
            );
            const labels = [...chatOptions.map((option) => option.label), 'Close'];
            const numberedLabels = labels.map((label, index) => `${index + 1}; ${label}`).join('|');
            const src = `[QUESTION ${numberedLabels}]`;
            player.sendQuestScript(QuestSkinEnum.NORMAL, src);
            return true;
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

        await this.dispatchStateEvent(killer, {
            eventType: QuestEventEnum.KILL,
            victim: new VictimQuest({ victim }),
        });
    }
}
