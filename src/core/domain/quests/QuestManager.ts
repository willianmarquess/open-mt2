import * as fs from 'fs';
import * as path from 'path';
import Logger from '@/core/infra/logger/Logger';
import { AbstractQuest } from './AbstractQuest';
import { getQuestMeta, QuestStatusEnum } from './decorators/QuestDecorator';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import Player from '../entities/game/player/Player';
import NPC from '../entities/game/mob/NPC';
import { NpcQuest } from './facade/NpcQuest';
import { VictimQuest } from './facade/VictimQuest';
import Monster from '../entities/game/mob/Monster';

export class QuestManager {
    private readonly logger: Logger;
    private readonly questsClasses: Map<number, typeof AbstractQuest> = new Map();
    private readonly questsClickEvents: Map<number, Map<number, Set<string>>> = new Map();
    private readonly eventQuestMap: Map<QuestEventEnum, Map<number, Set<string>>> = new Map();

    constructor({ logger }: { logger: Logger }) {
        this.logger = logger;
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
                const fullPath = path.join(baseDir, file);

                delete require.cache[require.resolve(fullPath)];
                // eslint-disable-next-line
                const mod = require(fullPath);

                const exports = Object.values(mod);
                for (const exp of exports) {
                    if (this.isQuestClass(exp)) {
                        const ctor: any = exp;
                        const meta = getQuestMeta(ctor);
                        const id = meta!.id;

                        if (this.questsClasses.has(id)) {
                            throw new Error(`[QuestManager] Quest class name should be unique, duplicated key: ${id}`);
                        }

                        this.questsClasses.set(id, ctor);

                        if (meta && meta.states) {
                            for (const [, metaState] of meta.states) {
                                for (const t of metaState.tasks) {
                                    switch (t.when) {
                                        case QuestEventEnum.CLICK:
                                            {
                                                const target = t.target as number | undefined;
                                                if (target !== undefined) {
                                                    let stateMap = this.questsClickEvents.get(target);
                                                    if (!stateMap) {
                                                        stateMap = new Map<number, Set<string>>();
                                                        this.questsClickEvents.set(target, stateMap);
                                                    }

                                                    let set = stateMap.get(id);
                                                    if (!set) {
                                                        set = new Set<string>();
                                                        stateMap.set(id, set);
                                                    }

                                                    set.add(metaState.name);
                                                } else {
                                                    this.logger.info(
                                                        `[QUEST_MANAGER] CLICK task without target in quest ${id}`,
                                                    );
                                                }
                                            }
                                            break;
                                        case QuestEventEnum.LOGIN:
                                            this.addQuestToEvent(QuestEventEnum.LOGIN, id, metaState.name);
                                            break;
                                        case QuestEventEnum.LOGOUT:
                                            this.addQuestToEvent(QuestEventEnum.LOGOUT, id, metaState.name);
                                            break;
                                        case QuestEventEnum.LEVELUP:
                                            this.addQuestToEvent(QuestEventEnum.LEVELUP, id, metaState.name);
                                            break;
                                        case QuestEventEnum.BUTTON:
                                            this.addQuestToEvent(QuestEventEnum.BUTTON, id, metaState.name);
                                            break;
                                        case QuestEventEnum.INFO:
                                            this.addQuestToEvent(QuestEventEnum.INFO, id, metaState.name);
                                            break;
                                        case QuestEventEnum.CHAT:
                                            this.addQuestToEvent(QuestEventEnum.CHAT, id, metaState.name);
                                            break;
                                        case QuestEventEnum.ATTR_IN:
                                            this.addQuestToEvent(QuestEventEnum.ATTR_IN, id, metaState.name);
                                            break;
                                        case QuestEventEnum.ATTR_OUT:
                                            this.addQuestToEvent(QuestEventEnum.ATTR_OUT, id, metaState.name);
                                            break;
                                        case QuestEventEnum.ITEM_USE:
                                            this.addQuestToEvent(QuestEventEnum.ITEM_USE, id, metaState.name);
                                            break;
                                        case QuestEventEnum.SERVER_TIMER:
                                            this.addQuestToEvent(QuestEventEnum.SERVER_TIMER, id, metaState.name);
                                            break;
                                        case QuestEventEnum.ENTER_STATE:
                                            this.addQuestToEvent(QuestEventEnum.ENTER_STATE, id, metaState.name);
                                            break;
                                        case QuestEventEnum.LEAVE_STATE:
                                            this.addQuestToEvent(QuestEventEnum.LEAVE_STATE, id, metaState.name);
                                            break;
                                        case QuestEventEnum.KILL:
                                            this.addQuestToEvent(QuestEventEnum.KILL, id, metaState.name);
                                            break;
                                    }
                                }
                            }
                        }

                        this.logger.info(`[QUEST_MANAGER] Loaded quest ${file} as id=${id}`);
                    }
                }
            } catch (err) {
                this.logger.error(`[QUEST_MANAGER] Failed to load quest file ${file}: ${(err as Error).message}`);
            }
        }

        this.logger.info(`[QUEST_MANAGER] Loaded ${this.questsClasses.size} quests`);
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

            const instance: AbstractQuest = new (questClass as any)({ player });
            (instance as any).id = meta?.id ?? id;
            (instance as any).name = meta?.name ?? id;

            if (meta && meta.states) {
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
            const quest = player.getQuestByStatus(QuestStatusEnum.PAUSE);

            if (!quest) {
                this.logger.error(`[QUEST_MANAGER] No active quest paused, playerId: ${player.getId()}`);
                return;
            }
            quest.unpause();
        }
    }

    async onClick(player: Player, npc: NPC) {
        if (player.isQuestRunning()) {
            this.logger.info(
                `[QUEST_MANAGER] Player ${player.getId()} logged in with running quest ${player.getCurrentQuest()?.getName()}`,
            );
            return;
        }

        const questMap = this.questsClickEvents.get(npc.getId()) ?? new Map<number, Set<string>>();
        for (const [questId, states] of questMap) {
            const quest = player.getQuest(questId);
            if (!quest) continue;
            const current = quest.getCurrentState()?.name;
            if (!current) continue;
            if (states.has(current)) {
                await quest.runState({ eventType: QuestEventEnum.CLICK, npc: new NpcQuest({ npc }) });
            }
        }
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
