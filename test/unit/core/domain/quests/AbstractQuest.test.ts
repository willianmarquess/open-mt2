import { expect } from 'chai';
import { AbstractQuest } from '@/core/domain/quests/AbstractQuest';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { QuestStatusEnum } from '@/core/domain/quests/decorators/QuestDecorator';

const tick = () => new Promise((resolve) => setImmediate(resolve));

class TestQuest extends AbstractQuest {
    public readonly sent: string[] = [];

    constructor(player: any) {
        super({ player });
        (this as any).id = 1;
        (this as any).name = 'TestQuest';
    }

    // Expose protected helpers for the test scenario.
    public async selectFlow() {
        this.title('Welcome');
        const answer = await (this as any).select(['A', 'B']);
        this.sent.push(`resolved:${answer}`);
    }
}

const createPlayer = () => {
    let currentQuest: any = null;
    return {
        setCurrentQuest: (q: any) => (currentQuest = q),
        getCurrentQuest: () => currentQuest,
        sendQuestScript: () => {},
    };
};

const buildQuest = () => {
    const player = createPlayer();
    const quest = new TestQuest(player);
    quest.addState({
        name: 'START',
        tasks: [{ when: QuestEventEnum.CLICK, callback: () => quest.selectFlow() }],
    });
    (quest as any).currentState = { name: 'START', tasks: (quest as any).states.get('START').tasks };
    return quest;
};

describe('AbstractQuest', () => {
    describe('run (detached interactive dispatch)', () => {
        it('should mark the quest running synchronously, before any await', () => {
            const quest = buildQuest();
            expect(quest.isRunning()).to.be.equal(false);

            quest.run({ eventType: QuestEventEnum.CLICK } as any);

            // Synchronous: no awaits yet, but the quest already reports running.
            expect(quest.isRunning()).to.be.equal(true);
        });

        it('should stay running while suspended on a select and settle after the answer', async () => {
            const quest = buildQuest();
            quest.run({ eventType: QuestEventEnum.CLICK } as any);
            await tick();

            expect(quest.getStatus()).to.be.equal(QuestStatusEnum.SELECT);
            expect(quest.isRunning()).to.be.equal(true);

            quest.unselect(0);
            await tick();
            await tick();

            expect(quest.getStatus()).to.be.equal(QuestStatusEnum.NONE);
            expect(quest.isRunning()).to.be.equal(false);
            expect(quest.sent).to.include('resolved:0');
        });

        it('should recover to a non-running state across repeated interactions', async () => {
            const quest = buildQuest();

            for (let i = 0; i < 3; i++) {
                quest.run({ eventType: QuestEventEnum.CLICK } as any);
                await tick();
                expect(quest.isRunning()).to.be.equal(true);
                quest.unselect(i);
                await tick();
                await tick();
                expect(quest.isRunning()).to.be.equal(false);
            }
        });
    });
});
