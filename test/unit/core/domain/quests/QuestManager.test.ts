import { expect } from 'chai';
import sinon from 'sinon';
import { QuestManager } from '@/core/domain/quests/QuestManager';
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
});
