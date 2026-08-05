import { expect } from 'chai';
import sinon from 'sinon';
import { AbstractQuest } from '@/core/domain/quests/AbstractQuest';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';

class TestQuest extends AbstractQuest {}

const createQuest = () => {
    const player = {
        sendQuestScript: () => {},
        setCurrentQuest: () => {},
        getId: () => 1,
        sendQuestInfo: () => {},
    };

    return new TestQuest({
        player: player as any,
        itemManager: {} as any,
        questTargetManager: {} as any,
    });
};

describe('AbstractQuest.runState', () => {
    afterEach(() => sinon.restore());

    it('should finish the state transition before it resolves (unawaited endRunning)', async () => {
        const quest = createQuest();
        const entered = sinon.stub();

        quest.addState({
            name: 'start',
            tasks: [
                {
                    when: QuestEventEnum.CLICK,
                    callback: () => ({ nextState: 'next' }),
                } as any,
            ],
        });
        quest.addState({
            name: 'next',
            tasks: [
                {
                    when: QuestEventEnum.ENTER_STATE,
                    callback: entered,
                } as any,
            ],
        });

        await quest.setState('start');
        await quest.runState({ eventType: QuestEventEnum.CLICK } as any);

        expect(quest.getCurrentState()?.name, 'the next state is already active').to.equal('next');
        expect(entered.called, 'the next state has already run its enter tasks').to.equal(true);
    });

    it('should run the letter tasks of the state it moved into', async () => {
        const quest = createQuest();
        const letter = sinon.stub();

        quest.addState({
            name: 'start',
            tasks: [
                {
                    when: QuestEventEnum.CLICK,
                    callback: () => ({ nextState: 'next' }),
                } as any,
            ],
        });
        quest.addState({
            name: 'next',
            tasks: [
                {
                    when: QuestEventEnum.LETTER,
                    callback: letter,
                } as any,
            ],
        });

        await quest.setState('start');
        await quest.runState({ eventType: QuestEventEnum.CLICK } as any);

        expect(letter.called, 'the new state letter task already ran').to.equal(true);
    });
});
