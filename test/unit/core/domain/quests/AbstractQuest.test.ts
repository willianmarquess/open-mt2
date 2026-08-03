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
    const scripts: Array<{ skin: number; src: string }> = [];
    return {
        setCurrentQuest: (q: any) => (currentQuest = q),
        getCurrentQuest: () => currentQuest,
        sendQuestScript: (skin: number, src: string) => scripts.push({ skin, src }),
        sendQuestInfoPacket: () => {},
        scripts,
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

    describe('letter lifecycle and trailing [DONE] (issue #58)', () => {
        class LetterQuest extends AbstractQuest {
            constructor(player: any) {
                super({ player } as any);
                (this as any).id = 7;
                (this as any).name = 'LetterQuest';
            }

            public async letterTask() {
                (this as any).letter('Hunt Quest');
            }

            public async describeTask() {
                (this as any).text('Kill 10 boars');
            }

            public async describeAndAdvanceTask() {
                (this as any).text('All done!');
                return (this as any).nextState('DONE_STATE');
            }

            public async countingTask() {}

            public async abortableSelectTask() {
                (this as any).text('Pick one');
                await (this as any).select(['A', 'B']);
            }
        }

        const buildLetterQuest = () => {
            const player = createPlayer();
            const quest = new LetterQuest(player);
            quest.addState({
                name: 'HUNT',
                tasks: [
                    { when: QuestEventEnum.LETTER, callback: () => quest.letterTask() },
                    { when: QuestEventEnum.BUTTON, callback: () => quest.describeTask() },
                    { when: QuestEventEnum.KILL, callback: () => quest.countingTask() },
                ] as any,
            });
            quest.addState({
                name: 'FINISH',
                tasks: [
                    { when: QuestEventEnum.LETTER, callback: () => quest.letterTask() },
                    { when: QuestEventEnum.BUTTON, callback: () => quest.describeAndAdvanceTask() },
                ] as any,
            });
            quest.addState({ name: 'DONE_STATE', tasks: [] as any });
            (quest as any).currentState = (quest as any).states.get('HUNT');
            return { quest, player };
        };

        it('should not send a bare [DONE] after showing a letter', async () => {
            const { quest, player } = buildLetterQuest();

            await quest.runState({ eventType: QuestEventEnum.LETTER } as any);

            expect(player.scripts).to.have.lengthOf(1);
            expect(player.scripts[0].src).to.include('[QUESTBUTTON');
            expect(player.scripts[0].src).to.not.include('[DONE]');
        });

        it('should re-arm the letter in the same script as the BUTTON reply', async () => {
            const { quest, player } = buildLetterQuest();
            await quest.runState({ eventType: QuestEventEnum.LETTER } as any);
            player.scripts.length = 0;

            await quest.runState({ eventType: QuestEventEnum.BUTTON } as any);

            expect(player.scripts).to.have.lengthOf(1);
            const { src } = player.scripts[0];
            expect(src).to.include('[QUESTBUTTON');
            expect(src).to.include('Kill 10 boars');
            expect(src).to.include('[DONE]');
            expect(src.indexOf('[QUESTBUTTON')).to.be.lessThan(src.indexOf('Kill 10 boars'));
        });

        it('should not re-arm the letter when the BUTTON task changes state', async () => {
            const { quest, player } = buildLetterQuest();
            (quest as any).currentState = (quest as any).states.get('FINISH');
            await quest.runState({ eventType: QuestEventEnum.LETTER } as any);
            player.scripts.length = 0;

            await quest.runState({ eventType: QuestEventEnum.BUTTON } as any);

            expect(player.scripts).to.have.lengthOf(1);
            expect(player.scripts[0].src).to.include('All done!');
            expect(player.scripts[0].src).to.not.include('[QUESTBUTTON');
        });

        it('should send nothing for a task with no output and no interaction', async () => {
            const { quest, player } = buildLetterQuest();

            await quest.runState({ eventType: QuestEventEnum.KILL } as any);

            expect(player.scripts).to.have.lengthOf(0);
        });

        it('should still send the bare [DONE] that releases an answered window', async () => {
            const player = createPlayer();
            const quest = new LetterQuest(player);
            quest.addState({
                name: 'START',
                tasks: [{ when: QuestEventEnum.CLICK, callback: () => quest.abortableSelectTask() }] as any,
            });
            (quest as any).currentState = (quest as any).states.get('START');

            quest.run({ eventType: QuestEventEnum.CLICK } as any);
            await tick();
            quest.unselect(0);
            await tick();
            await tick();

            const last = player.scripts[player.scripts.length - 1];
            expect(last.src).to.be.equal('[DONE]');
        });

        it('should re-send the letter when a letter select is closed without an answer', async () => {
            const { quest, player } = buildLetterQuest();
            (quest as any).currentState.tasks = [
                { when: QuestEventEnum.LETTER, callback: () => quest.letterTask() },
                { when: QuestEventEnum.BUTTON, callback: () => quest.abortableSelectTask() },
            ];
            await quest.runState({ eventType: QuestEventEnum.LETTER } as any);
            player.scripts.length = 0;

            quest.run({ eventType: QuestEventEnum.BUTTON } as any);
            await tick();
            quest.cancel();
            await tick();
            await tick();

            const rearmed = player.scripts.some((s) => s.src.includes('[QUESTBUTTON'));
            expect(rearmed).to.be.equal(true);
        });
    });

    describe('inventory items listed in a private shop (issue #128)', () => {
        const POTION_VNUM = 27001;

        class InventoryQuest extends AbstractQuest {
            constructor(player: any, itemManager: any) {
                super({ player, itemManager } as any);
                (this as any).id = 9;
                (this as any).name = 'InventoryQuest';
            }

            public count(vnum: number) {
                return (this as any).countItem(vnum);
            }

            public take(vnum: number, quantity: number) {
                return (this as any).removeItem(vnum, quantity);
            }
        }

        const createItem = (dbId: number, count: number) => ({
            dbId,
            getId: () => POTION_VNUM,
            getCount: () => count,
            getPosition: () => dbId,
            getSize: () => 1,
            decreaseCount: () => {},
        });

        const buildQuest = (items: Array<any>, listed: Array<any>) => {
            const removed: Array<any> = [];
            const player: any = {
                getInventory: () => ({
                    getItems: () => new Map(items.map((item) => [item.dbId, item])),
                    removeItem: (position: number) => removed.push(position),
                }),
                isItemLockedInPrivateShop: (item: any) => listed.includes(item),
                sendItemUpdate: () => {},
                sendItemRemoved: () => {},
            };
            const itemManager: any = { update: async () => {}, delete: async () => {} };

            return { quest: new InventoryQuest(player, itemManager), removed };
        };

        it('should not count items that are for sale in the private shop', () => {
            const forSale = createItem(1, 5);
            const spare = createItem(2, 3);
            const { quest } = buildQuest([forSale, spare], [forSale]);

            expect(quest.count(POTION_VNUM)).to.be.equal(3);
        });

        it('should count everything while no private shop lists them', () => {
            const first = createItem(1, 5);
            const second = createItem(2, 3);
            const { quest } = buildQuest([first, second], []);

            expect(quest.count(POTION_VNUM)).to.be.equal(8);
        });

        it('should refuse to consume a quest requirement that is only met by items for sale', async () => {
            const forSale = createItem(1, 5);
            const { quest, removed } = buildQuest([forSale], [forSale]);

            expect(await quest.take(POTION_VNUM, 5)).to.be.equal(false);
            expect(removed).to.be.deep.equal([]);
        });
    });
});
