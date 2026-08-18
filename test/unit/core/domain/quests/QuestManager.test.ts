import { expect } from 'chai';
import sinon from 'sinon';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import { AbstractQuest } from '@/core/domain/quests/AbstractQuest';
import { QuestStatusEnum } from '@/core/domain/quests/decorators/QuestDecorator';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const CLOSE_WINDOW_ANSWER = 254;
const NPC_VNUM = 20349;
const QUEST_ID = 7;
const STATE_NAME = 'START';

const createMenuPlayer = (quest: any, questsByStatus: Partial<Record<QuestStatusEnum, any>>) =>
    ({
        getId: () => 1,
        isQuestRunning: () => false,
        getQuest: (id: number) => (id === QUEST_ID ? quest : null),
        getQuestByStatus: (status: QuestStatusEnum) => questsByStatus[status] ?? null,
        sendQuestScript: sinon.spy(),
    }) as any;

const openChatMenu = (questManager: QuestManager, player: any) => {
    (questManager as any).registerChatTask(QUEST_ID, STATE_NAME, {
        when: QuestEventEnum.CHAT,
        target: NPC_VNUM,
        chat: 'Train a Horse',
        handlerName: 'onChat',
    });

    return questManager.onClick(player, { isNPC: () => true, getId: () => NPC_VNUM } as any);
};

const createMenuQuest = () => ({ getCurrentState: () => ({ name: STATE_NAME }), run: sinon.spy() });

const createDialogQuest = () => ({ unselect: sinon.spy(), cancel: sinon.spy(), unpause: sinon.spy() });

describe('QuestManager', () => {
    let questManager: QuestManager;

    beforeEach(() => {
        questManager = new QuestManager({ logger, shopManager: {} as any } as any);
    });

    describe('onAnswer', () => {
        const createPlayer = (questsByStatus: Partial<Record<QuestStatusEnum, any>>) =>
            ({
                getId: () => 1,
                getQuestByStatus: (status: QuestStatusEnum) => questsByStatus[status] ?? undefined,
            }) as any;

        it('should unselect the quest awaiting select for valid answers', () => {
            const quest = createDialogQuest();
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.SELECT]: quest }), 1);

            expect(quest.unselect.calledOnceWith(1)).to.be.equal(true);
            expect(quest.cancel.called).to.be.equal(false);
        });

        it('should unpause a paused quest when the next button is pressed', () => {
            const quest = createDialogQuest();
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.PAUSE]: quest }), CLOSE_WINDOW_ANSWER);

            expect(quest.unpause.calledOnce).to.be.equal(true);
        });

        it('should cancel a quest stuck awaiting select when the window is closed', () => {
            const quest = createDialogQuest();
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.SELECT]: quest }), CLOSE_WINDOW_ANSWER);

            expect(quest.cancel.calledOnce).to.be.equal(true);
            expect(quest.unselect.called).to.be.equal(false);
        });

        it('should not throw when there is no active quest', () => {
            expect(() => questManager.onAnswer(createPlayer({}), CLOSE_WINDOW_ANSWER)).to.not.throw();
        });

        it('should route the answer to the chat menu the player just opened', async () => {
            const menuQuest = createMenuQuest();
            const player = createMenuPlayer(menuQuest, {});

            expect(await openChatMenu(questManager, player), 'setup: the chat menu opened').to.be.equal(true);

            questManager.onAnswer(player, 0);

            expect(menuQuest.run.calledOnce).to.be.equal(true);
        });

        it('should not let a chat menu outrank a quest that is awaiting an answer', async () => {
            const menuQuest = createMenuQuest();
            const questsByStatus: Partial<Record<QuestStatusEnum, any>> = {};
            const player = createMenuPlayer(menuQuest, questsByStatus);

            expect(await openChatMenu(questManager, player), 'setup: the chat menu opened').to.be.equal(true);

            const dialogQuest = createDialogQuest();
            questsByStatus[QuestStatusEnum.SELECT] = dialogQuest;

            questManager.onAnswer(player, 1);

            expect(dialogQuest.unselect.calledOnceWith(1)).to.be.equal(true);
            expect(menuQuest.run.called).to.be.equal(false);
        });
    });

    describe('onDespawn', () => {
        it('should drop a chat menu the player left unanswered', async () => {
            const menuQuest = createMenuQuest();
            const player = createMenuPlayer(menuQuest, {});

            expect(await openChatMenu(questManager, player), 'setup: the chat menu opened').to.be.equal(true);

            questManager.onDespawn(player);
            questManager.onAnswer(player, 0);

            expect(menuQuest.run.called).to.be.equal(false);
        });
    });

    describe('click -> select() -> answer, end to end (real AbstractQuest, like SkillQuest confirmOnClickSkillTeacher)', () => {
        const CLICK_QUEST_ID = 99;
        const CLICK_STATE = 'CONFIRM';
        const CLICK_NPC_VNUM = 20300;

        class YesNoQuest extends AbstractQuest {
            public reachedYes = false;

            async onClickNpc() {
                this.title('Confirm?');
                const option = await this.select(['Yes', 'No']);
                if (option === 0) this.reachedYes = true;
                return this.done();
            }
        }

        async function makeRealQuestSetup() {
            const sentPackets: Array<unknown> = [];
            const questsById = new Map<number, AbstractQuest>();

            const player: any = {
                getId: () => 1,
                sendQuestScript: (skin: unknown, src: unknown) => sentPackets.push({ skin, src }),
                sendQuestInfoPacket: () => {},
                setCurrentQuest: (quest: AbstractQuest) => (player.currentQuest = quest),
                getCurrentQuest: () => player.currentQuest,
                isQuestRunning: () => player.currentQuest?.isRunning() ?? false,
                addQuest: (id: number, quest: AbstractQuest) => questsById.set(id, quest),
                getQuest: (id: number) => questsById.get(id) ?? null,
                getQuestByStatus: (status: QuestStatusEnum) => {
                    for (const quest of questsById.values()) {
                        if (quest.getStatus() === status) return quest;
                    }
                    return null;
                },
            };

            const quest = new YesNoQuest({ player, itemManager: {} as any, questTargetManager: {} as any });
            quest.addState({
                name: CLICK_STATE,
                tasks: [
                    {
                        when: QuestEventEnum.CLICK,
                        target: CLICK_NPC_VNUM,
                        callback: (quest as any).onClickNpc.bind(quest),
                        handlerName: 'onClickNpc',
                    },
                ],
            });
            player.addQuest(CLICK_QUEST_ID, quest);
            await quest.setState(CLICK_STATE);

            const questManager = new QuestManager({ logger, shopManager: {} as any } as any);
            (questManager as any).registerClickTask(CLICK_QUEST_ID, CLICK_STATE, CLICK_NPC_VNUM);

            const npc = { isNPC: () => true, getId: () => CLICK_NPC_VNUM };

            return { questManager, player, quest, npc, sentPackets };
        }

        it('sends the select() question on the first click', async () => {
            const { questManager, player, npc, sentPackets } = await makeRealQuestSetup();

            const handled = await questManager.onClick(player, npc);

            expect(handled, 'the click was routed to the quest').to.be.equal(true);
            expect(sentPackets.length, 'the select() question was sent to the client').to.equal(1);
        });

        it('unblocks after the answer, so the player is not stuck forever (no more packets ever again)', async () => {
            const { questManager, player, quest, npc, sentPackets } = await makeRealQuestSetup();

            await questManager.onClick(player, npc);
            // run() is detached (fire-and-forget) up to the suspend point inside select();
            // give the microtask queue a tick to reach it.
            await new Promise((resolve) => setImmediate(resolve));

            expect(quest.getStatus(), 'setup: the quest is suspended awaiting the answer').to.equal(
                QuestStatusEnum.SELECT,
            );

            questManager.onAnswer(player, 0); // "Yes" - onAnswer's answer is 0-indexed (see chatOptions[answer] below)
            await new Promise((resolve) => setImmediate(resolve));

            expect(quest.reachedYes, 'the answer actually reached the quest body').to.be.equal(true);
            expect(player.isQuestRunning(), 'the quest must not stay stuck running forever').to.equal(false);

            // A second click must still be handled - this is what silently breaks (no packet, ever
            // again) if isQuestRunning()/status never gets reset after the first answer.
            sentPackets.length = 0;
            const handledAgain = await questManager.onClick(player, npc);

            expect(handledAgain, 'a later click on the same NPC must not be silently swallowed').to.equal(true);
        });
    });

    describe('onLogout', () => {
        it('should dispatch the logout event to a quest subscribed in its current state', async () => {
            const quest = { getCurrentState: () => ({ name: STATE_NAME }), runState: sinon.stub().resolves() };
            (questManager as any).addQuestToEvent(QuestEventEnum.LOGOUT, QUEST_ID, STATE_NAME);

            await questManager.onLogout(createMenuPlayer(quest, {}));

            expect(quest.runState.calledOnceWith({ eventType: QuestEventEnum.LOGOUT })).to.be.equal(true);
        });

        it('should not dispatch the logout event to a quest that already left that state', async () => {
            const quest = { getCurrentState: () => ({ name: 'DONE' }), runState: sinon.stub().resolves() };
            (questManager as any).addQuestToEvent(QuestEventEnum.LOGOUT, QUEST_ID, STATE_NAME);

            await questManager.onLogout(createMenuPlayer(quest, {}));

            expect(quest.runState.called).to.be.equal(false);
        });

        it('should drop a chat menu the player left unanswered', async () => {
            const menuQuest = createMenuQuest();
            const player = createMenuPlayer(menuQuest, {});

            expect(await openChatMenu(questManager, player), 'setup: the chat menu opened').to.be.equal(true);

            await questManager.onLogout(player);
            questManager.onAnswer(player, 0);

            expect(menuQuest.run.called).to.be.equal(false);
        });
    });

    describe('onButton (issue #100)', () => {
        const QUEST_ID = 7;
        const STATE = 'RUN';

        let questManager: QuestManager;
        let quest: any;

        const createPlayer = (isQuestRunning: boolean) =>
            ({
                getId: () => 1,
                getQuest: () => quest,
                getCurrentQuest: () => (isQuestRunning ? quest : null),
                isQuestRunning: () => isQuestRunning,
            }) as any;

        beforeEach(() => {
            questManager = new QuestManager({ logger, shopManager: {} as any });
            quest = {
                getName: () => 'TestQuest',
                getCurrentState: () => ({ name: STATE }),
                runState: sinon.stub().resolves(),
                run: sinon.spy(),
            };
            (questManager as any).eventQuestMap.set(QuestEventEnum.BUTTON, new Map([[QUEST_ID, new Set([STATE])]]));
        });

        it('should dispatch the button event when no quest is running', async () => {
            await questManager.onButton(createPlayer(false), QUEST_ID);

            // Dispatched via run(), not a directly-awaited runState() - see the comment on
            // QuestManager.onButton: awaiting it here would deadlock the corked socket if the
            // button handler leads into a select() (issue: quest skill click hangs the client).
            expect(quest.run.calledOnce, 'the button reaches the quest').to.be.equal(true);
            expect(quest.run.firstCall.args[0]).to.deep.equal({ eventType: QuestEventEnum.BUTTON });
        });

        it('should refuse a button press while another quest is mid-flight', async () => {
            await questManager.onButton(createPlayer(true), QUEST_ID);

            expect(
                quest.run.called,
                'a second dispatch would strand the suspended coroutine on an orphaned promise',
            ).to.be.equal(false);
        });
    });
});
