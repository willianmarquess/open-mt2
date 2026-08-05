import { expect } from 'chai';
import sinon from 'sinon';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import { QuestStatusEnum } from '@/core/domain/quests/decorators/QuestDecorator';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const CLOSE_WINDOW_ANSWER = 254;

describe('QuestManager', () => {
    describe('onAnswer', () => {
        let questManager: QuestManager;

        beforeEach(() => {
            questManager = new QuestManager({ logger, shopManager: {} as any });
        });

        const createPlayer = (questsByStatus: Partial<Record<QuestStatusEnum, any>>) =>
            ({
                getId: () => 1,
                getQuestByStatus: (status: QuestStatusEnum) => questsByStatus[status] ?? undefined,
            }) as any;

        it('should unselect the quest awaiting select for valid answers', () => {
            const quest = { unselect: sinon.spy(), cancel: sinon.spy(), unpause: sinon.spy() };
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.SELECT]: quest }), 1);

            expect(quest.unselect.calledOnceWith(1)).to.be.equal(true);
            expect(quest.cancel.called).to.be.equal(false);
        });

        it('should unpause a paused quest when the next button is pressed', () => {
            const quest = { unselect: sinon.spy(), cancel: sinon.spy(), unpause: sinon.spy() };
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.PAUSE]: quest }), CLOSE_WINDOW_ANSWER);

            expect(quest.unpause.calledOnce).to.be.equal(true);
        });

        it('should cancel a quest stuck awaiting select when the window is closed', () => {
            const quest = { unselect: sinon.spy(), cancel: sinon.spy(), unpause: sinon.spy() };
            questManager.onAnswer(createPlayer({ [QuestStatusEnum.SELECT]: quest }), CLOSE_WINDOW_ANSWER);

            expect(quest.cancel.calledOnce).to.be.equal(true);
            expect(quest.unselect.called).to.be.equal(false);
        });

        it('should not throw when there is no active quest', () => {
            expect(() => questManager.onAnswer(createPlayer({}), CLOSE_WINDOW_ANSWER)).to.not.throw();
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
            };
            (questManager as any).eventQuestMap.set(QuestEventEnum.BUTTON, new Map([[QUEST_ID, new Set([STATE])]]));
        });

        it('should dispatch the button event when no quest is running', async () => {
            await questManager.onButton(createPlayer(false), QUEST_ID);

            expect(quest.runState.calledOnce, 'the button reaches the quest').to.be.equal(true);
        });

        it('should refuse a button press while another quest is mid-flight', async () => {
            await questManager.onButton(createPlayer(true), QUEST_ID);

            expect(
                quest.runState.called,
                'a second dispatch would strand the suspended coroutine on an orphaned promise',
            ).to.be.equal(false);
        });
    });
});
