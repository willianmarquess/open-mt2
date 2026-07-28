import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { Quest, Task } from '../decorators/QuestDecorator';

enum HorseTrainingQuestState {
    START = 'START',
    TRAINING = 'TRAINING',
    REPORT = 'REPORT',
}

const STABLE_MASTER_VNUM = 20349;
const HORSE_MEDAL_VNUM = 50050;
const KILLS_PER_GRADE: Record<number, number> = { 1: 5, 2: 10, 3: 15 };

/**
 * Horse training (issue #43): raises the horse level by 1 inside a grade.
 * Grade boundaries (10->11, 20->21) are handled by the upgrade quest (#44).
 *
 * Flow (adapted from the original horse_levelup quest): talk to the Stable
 * Boy mounted with a Horse Medal -> kill monsters while mounted -> report
 * back -> the medal is consumed and the horse levels up.
 */
@Quest('HorseTrainingQuest', HorseTrainingQuestState.START)
export class HorseTrainingQuest extends AbstractQuest {
    private canTrain(): boolean {
        const level = this.player.getHorseLevel();
        // Level must be inside a grade: 1-9, 11-19 or 21-29. The boundaries
        // (0, 10, 20, 30) are either "no horse", upgrade-quest territory or
        // the max level.
        return level > 0 && level < 30 && level % 10 !== 0;
    }

    private getRequiredKills(): number {
        return KILLS_PER_GRADE[this.player.getHorseGrade()] ?? 5;
    }

    private getKillCount(): number {
        return Number(this.getValue('killCount') || 0);
    }

    @Task({
        state: HorseTrainingQuestState.START,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Train your horse',
        with: ({ player }) => {
            const level = player.getHorseLevel();
            return level > 0 && level < 30 && level % 10 !== 0;
        },
    })
    async onTrainChat() {
        this.title('Stable Boy:');

        if (!this.canTrain()) return;

        if (this.player.getHorseHealth() <= 0) {
            this.text('Your horse is dead. Revive it first.');
            return;
        }

        if (!this.player.isHorseRiding()) {
            this.text('You must come here riding your horse.');
            return;
        }

        if (this.countItem(HORSE_MEDAL_VNUM) < 1) {
            this.text('Training results are recorded on a Horse Medal.');
            this.text('Bring one and we can begin.');
            return;
        }

        const kills = this.getRequiredKills();
        if (this.player.getHorseGrade() === 1) {
            // A beginner horse cannot fight (the client refuses attacks on a
            // grade-1 mount), so its training is watching the owner fight.
            this.text('Your horse is too young to fight from its back.');
            this.text(`Defeat ${kills} monsters while it watches and learns.`);
        } else {
            this.text('Attacking from horseback is much harder than just riding.');
            this.text(`Defeat ${kills} monsters without leaving your horse.`);
        }
        this.text('Come back when you are done.');

        this.addValue('killCount', 0);
        return this.nextState(HorseTrainingQuestState.TRAINING);
    }

    @Task({ state: HorseTrainingQuestState.TRAINING, when: QuestEventEnum.LETTER })
    async trainingOnLetter() {
        this.letter('Horse Training');
    }

    @Task({ state: HorseTrainingQuestState.TRAINING, when: QuestEventEnum.BUTTON })
    async trainingOnButton() {
        this.describeTraining();
    }

    @Task({ state: HorseTrainingQuestState.TRAINING, when: QuestEventEnum.INFO })
    async trainingOnInfo() {
        this.describeTraining();
    }

    private describeTraining() {
        const kills = this.getRequiredKills();
        const remaining = Math.max(0, kills - this.getKillCount());
        this.title('Horse Training');
        if (this.player.getHorseGrade() === 1) {
            this.text(`Defeat monsters while your horse watches.`);
        } else {
            this.text(`Defeat monsters while riding your horse.`);
        }
        this.text(`${remaining} of ${kills} left.`);
    }

    @Task({ state: HorseTrainingQuestState.TRAINING, when: QuestEventEnum.KILL })
    async trainingOnKill() {
        // Grades 2-3: only kills made from horseback count; dismounting just
        // pauses progress (original: dismounting failed the whole mission).
        // Grade 1: the client refuses attacks on a beginner mount, so kills
        // count on foot.
        if (this.player.getHorseGrade() >= 2 && !this.player.isHorseRiding()) return;

        const killCount = this.getKillCount() + 1;
        this.addValue('killCount', killCount);

        if (killCount >= this.getRequiredKills()) {
            return this.nextState(HorseTrainingQuestState.REPORT);
        }
    }

    @Task({ state: HorseTrainingQuestState.REPORT, when: QuestEventEnum.LETTER })
    async reportOnLetter() {
        this.letter('Horse Training');
    }

    @Task({ state: HorseTrainingQuestState.REPORT, when: QuestEventEnum.BUTTON })
    async reportOnButton() {
        this.describeReport();
    }

    @Task({ state: HorseTrainingQuestState.REPORT, when: QuestEventEnum.INFO })
    async reportOnInfo() {
        this.describeReport();
    }

    private describeReport() {
        this.title('Horse Training');
        this.text('Training complete!');
        this.text('Report back to the Stable Boy.');
    }

    @Task({
        state: HorseTrainingQuestState.REPORT,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Report your training',
    })
    async onReportChat() {
        this.title('Stable Boy:');

        if (!this.canTrain()) {
            // Level changed under us (e.g. GM command) — just reset.
            return this.nextState(HorseTrainingQuestState.START);
        }

        if (this.countItem(HORSE_MEDAL_VNUM) < 1) {
            this.text('The results must be recorded on a Horse Medal.');
            this.text('Bring one to finish the training.');
            return;
        }

        await this.removeItem(HORSE_MEDAL_VNUM, 1);

        this.player.setHorseLevel(this.player.getHorseLevel() + 1);

        this.text('Your horse got stronger from the training!');
        this.text(`It is now level ${this.player.getHorseLevel()}.`);

        if (this.player.getHorseLevel() % 10 === 0) {
            this.text('It cannot grow further by training alone —');
            this.text('ask me about an upgrade when you are ready.');
        }

        return this.nextState(HorseTrainingQuestState.START);
    }
}
