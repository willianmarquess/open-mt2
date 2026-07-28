import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { Quest, Task } from '../decorators/QuestDecorator';

enum HorseUpgradeQuestState {
    START = 'START',
    TEST = 'TEST',
    REPORT = 'REPORT',
}

const STABLE_MASTER_VNUM = 20349;
const TEST_DURATION_MS = 10 * 60 * 1_000;
const TEST_TIMER_ID = 'HORSE_UPGRADE_TEST_TIMER';

type UpgradeConfig = {
    minPlayerLevel: number;
    bookVnum: number;
    bookName: string;
    kills: number;
    nextLevel: number;
};

/** Keyed by the exact horse level at which the upgrade is available. */
const UPGRADES: Record<number, UpgradeConfig> = {
    10: { minPlayerLevel: 35, bookVnum: 50052, bookName: 'Armed Horse Book', kills: 20, nextLevel: 11 },
    20: { minPlayerLevel: 50, bookVnum: 50053, bookName: 'Military Horse Book', kills: 30, nextLevel: 21 },
};

/**
 * Horse grade upgrade (issue #44): crosses the 10->11 and 20->21 grade
 * boundaries that training (#43) deliberately blocks.
 *
 * Adapted from the original horse_upgrade quests: a timed combat test,
 * then the next-grade horse book is consumed and the horse advances.
 * The player-level gates (35/50) match the original c_aHorseStat minima.
 */
@Quest('HorseUpgradeQuest', HorseUpgradeQuestState.START)
export class HorseUpgradeQuest extends AbstractQuest {
    private getConfig(): UpgradeConfig | undefined {
        return UPGRADES[this.player.getHorseLevel()];
    }

    private getKillCount(): number {
        return Number(this.getValue('killCount') || 0);
    }

    private getDeadline(): number {
        return Number(this.getValue('deadline') || 0);
    }

    private isExpired(): boolean {
        return Date.now() > this.getDeadline();
    }

    @Task({
        state: HorseUpgradeQuestState.START,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Upgrade your horse',
        with: ({ player }) => player.getHorseLevel() in UPGRADES,
    })
    async onUpgradeChat() {
        this.title('Stable Boy:');

        const config = this.getConfig();
        if (!config) return;

        if (this.player.getHorseHealth() <= 0) {
            this.text('Your horse is dead. Revive it first.');
            return;
        }

        if (this.player.getLevel() < config.minPlayerLevel) {
            this.text('Your horse is ready, but you are not.');
            this.text(`Come back at level ${config.minPlayerLevel}.`);
            return;
        }

        if (this.countItem(config.bookVnum) < 1) {
            this.text(`A stronger horse must be registered in a ${config.bookName}.`);
            this.text('Bring one and we can begin the test.');
            return;
        }

        const minutes = TEST_DURATION_MS / 60_000;
        this.text('Then prove you are worthy of a stronger mount.');
        this.text(`Defeat ${config.kills} monsters within ${minutes} minutes.`);
        this.text('Return to me when it is done.');

        this.addValue('killCount', 0);
        this.addValue('deadline', Date.now() + TEST_DURATION_MS);

        // Announce the failure the moment time runs out instead of leaving
        // the player to discover it in the quest letter.
        this.player.removeEventTimer(TEST_TIMER_ID);
        this.player.addEventTimer({
            id: TEST_TIMER_ID,
            eventFunction: () => {
                if (this.isExpired()) {
                    this.player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: '[Horse Upgrade] Time is up! Talk to the Stable Boy to try again.',
                    });
                }
            },
            options: { interval: TEST_DURATION_MS, duration: TEST_DURATION_MS },
        });

        return this.nextState(HorseUpgradeQuestState.TEST);
    }

    /**
     * The Stable Boy stays responsive during the test: shows progress, and
     * after the deadline this is the way back to START (without it an expired
     * test with no further kills would soft-lock the quest).
     */
    @Task({
        state: HorseUpgradeQuestState.TEST,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Report the upgrade test',
    })
    async onTestChat() {
        this.title('Stable Boy:');
        const config = this.getConfig();

        if (!config || this.isExpired()) {
            this.player.removeEventTimer(TEST_TIMER_ID);
            this.text('Time ran out — the test has failed.');
            this.text('Rest, and ask me again when you are ready.');
            return this.nextState(HorseUpgradeQuestState.START);
        }

        const remaining = Math.max(0, config.kills - this.getKillCount());
        const minutesLeft = Math.max(0, Math.ceil((this.getDeadline() - Date.now()) / 60_000));
        this.text('The test is not over yet.');
        this.text(`${remaining} monsters left, ${minutesLeft} min remaining.`);
    }

    @Task({ state: HorseUpgradeQuestState.TEST, when: QuestEventEnum.LETTER })
    async testOnLetter() {
        this.letter('Horse Upgrade');
    }

    @Task({ state: HorseUpgradeQuestState.TEST, when: QuestEventEnum.BUTTON })
    async testOnButton() {
        this.describeTest();
    }

    @Task({ state: HorseUpgradeQuestState.TEST, when: QuestEventEnum.INFO })
    async testOnInfo() {
        this.describeTest();
    }

    private describeTest() {
        const config = this.getConfig();
        if (!config) return;

        this.title('Horse Upgrade');

        if (this.isExpired()) {
            this.text('Time is up! The test has failed.');
            this.text('Talk to the Stable Boy to try again.');
            return;
        }

        const remaining = Math.max(0, config.kills - this.getKillCount());
        const minutesLeft = Math.max(0, Math.ceil((this.getDeadline() - Date.now()) / 60_000));
        this.text(`Defeat monsters to prove your worth.`);
        this.text(`${remaining} of ${config.kills} left, ${minutesLeft} min remaining.`);
    }

    @Task({ state: HorseUpgradeQuestState.TEST, when: QuestEventEnum.KILL })
    async testOnKill() {
        const config = this.getConfig();
        if (!config) return this.nextState(HorseUpgradeQuestState.START);

        if (this.isExpired()) {
            return this.nextState(HorseUpgradeQuestState.START);
        }

        const killCount = this.getKillCount() + 1;
        this.addValue('killCount', killCount);

        if (killCount >= config.kills) {
            this.player.removeEventTimer(TEST_TIMER_ID);
            return this.nextState(HorseUpgradeQuestState.REPORT);
        }
    }

    @Task({ state: HorseUpgradeQuestState.REPORT, when: QuestEventEnum.LETTER })
    async reportOnLetter() {
        this.letter('Horse Upgrade');
    }

    @Task({ state: HorseUpgradeQuestState.REPORT, when: QuestEventEnum.BUTTON })
    async reportOnButton() {
        this.describeReport();
    }

    @Task({ state: HorseUpgradeQuestState.REPORT, when: QuestEventEnum.INFO })
    async reportOnInfo() {
        this.describeReport();
    }

    private describeReport() {
        this.title('Horse Upgrade');
        this.text('Test passed!');
        this.text('Report back to the Stable Boy.');
    }

    @Task({
        state: HorseUpgradeQuestState.REPORT,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Report the upgrade test',
    })
    async onReportChat() {
        this.title('Stable Boy:');

        const config = this.getConfig();
        if (!config) {
            // Horse level changed under us (e.g. GM command) — reset.
            return this.nextState(HorseUpgradeQuestState.START);
        }

        if (this.countItem(config.bookVnum) < 1) {
            this.text(`The new horse must be registered in a ${config.bookName}.`);
            this.text('Bring one to complete the upgrade.');
            return;
        }

        await this.removeItem(config.bookVnum, 1);
        this.player.setHorseLevel(config.nextLevel);

        this.text('You proved yourself worthy!');
        this.text(`Your horse advanced to level ${config.nextLevel} —`);
        this.text('summon it and see how it grew.');

        return this.nextState(HorseUpgradeQuestState.START);
    }
}
