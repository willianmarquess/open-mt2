import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import {
    ButtonExecutionContext,
    ClickExecutionContext,
    ConditionFuncParams,
    InfoExecutionContext,
    StateExecutionContext,
    Task,
    TaskResult,
} from '../decorators/QuestDecorator';
import { PlayerQuest } from '../facade/PlayerQuest';
import { AssasinSubJobEnum, ShamanSubJobEnum, SuraSubJobEnum, WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { JobEnum } from '@/core/enum/JobEnum';
import { EmpireEnum } from '@/core/enum/EmpireEnum';

enum SkillQuestState {
    START = 'START',
    RUN = 'RUN',
    CONFIRM = 'CONFIRM',
}

const TARGET_NAME = 'skill_teacher';

interface SkillTeacherConfig {
    vnum: number;
    job: JobEnum;
    empire: EmpireEnum;
    subjob: number; // WarriorSubJobEnum | AssasinSubJobEnum | SuraSubJobEnum | ShamanSubJobEnum
}

const SKILL_TEACHER_TARGETS: SkillTeacherConfig[] = [
    // WARRIOR
    { vnum: 20300, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.RED, subjob: WarriorSubJobEnum.BODY },
    { vnum: 20301, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.RED, subjob: WarriorSubJobEnum.MENTAL },
    { vnum: 20320, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.YELLOW, subjob: WarriorSubJobEnum.BODY },
    { vnum: 20321, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.YELLOW, subjob: WarriorSubJobEnum.MENTAL },
    { vnum: 20340, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.BLUE, subjob: WarriorSubJobEnum.BODY },
    { vnum: 20341, job: JobEnum.WARRIOR_MALE, empire: EmpireEnum.BLUE, subjob: WarriorSubJobEnum.MENTAL },

    // ASSASSIN
    { vnum: 20302, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.RED, subjob: AssasinSubJobEnum.DAGGER },
    { vnum: 20303, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.RED, subjob: AssasinSubJobEnum.ARCHER },
    { vnum: 20322, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.YELLOW, subjob: AssasinSubJobEnum.DAGGER },
    { vnum: 20323, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.YELLOW, subjob: AssasinSubJobEnum.ARCHER },
    { vnum: 20342, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.BLUE, subjob: AssasinSubJobEnum.DAGGER },
    { vnum: 20343, job: JobEnum.ASSASSIN_MALE, empire: EmpireEnum.BLUE, subjob: AssasinSubJobEnum.ARCHER },

    // SURA
    { vnum: 20304, job: JobEnum.SURA_MALE, empire: EmpireEnum.RED, subjob: SuraSubJobEnum.SWORD },
    { vnum: 20305, job: JobEnum.SURA_MALE, empire: EmpireEnum.RED, subjob: SuraSubJobEnum.MAGIC },
    { vnum: 20324, job: JobEnum.SURA_MALE, empire: EmpireEnum.YELLOW, subjob: SuraSubJobEnum.SWORD },
    { vnum: 20325, job: JobEnum.SURA_MALE, empire: EmpireEnum.YELLOW, subjob: SuraSubJobEnum.MAGIC },
    { vnum: 20344, job: JobEnum.SURA_MALE, empire: EmpireEnum.BLUE, subjob: SuraSubJobEnum.SWORD },
    { vnum: 20345, job: JobEnum.SURA_MALE, empire: EmpireEnum.BLUE, subjob: SuraSubJobEnum.MAGIC },

    // SHAMAN
    { vnum: 20306, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.RED, subjob: ShamanSubJobEnum.BUFFER },
    { vnum: 20307, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.RED, subjob: ShamanSubJobEnum.HEALER },
    { vnum: 20326, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.YELLOW, subjob: ShamanSubJobEnum.BUFFER },
    { vnum: 20327, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.YELLOW, subjob: ShamanSubJobEnum.HEALER },
    { vnum: 20346, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.BLUE, subjob: ShamanSubJobEnum.BUFFER },
    { vnum: 20347, job: JobEnum.SHAMAN_MALE, empire: EmpireEnum.BLUE, subjob: ShamanSubJobEnum.HEALER },
];

const SKILL_TEACHER_BY_VNUM = new Map<number, SkillTeacherConfig>(
    SKILL_TEACHER_TARGETS.map((config) => [config.vnum, config]),
);

function playerMatchesJob(player: PlayerQuest, job: JobEnum): boolean {
    switch (job) {
        case JobEnum.WARRIOR_MALE:
        case JobEnum.WARRIOR_FEMALE:
            return player.isWarrior();
        case JobEnum.ASSASSIN_MALE:
        case JobEnum.ASSASSIN_FEMALE:
            return player.isAssassin();
        case JobEnum.SURA_MALE:
        case JobEnum.SURA_FEMALE:
            return player.isSura();
        case JobEnum.SHAMAN_MALE:
        case JobEnum.SHAMAN_FEMALE:
            return player.isShaman();
    }
}

function playerMatchesEmpire(player: PlayerQuest, empire: EmpireEnum): boolean {
    switch (empire) {
        case EmpireEnum.RED:
            return player.isFromRed();
        case EmpireEnum.YELLOW:
            return player.isFromYellow();
        case EmpireEnum.BLUE:
            return player.isFromBlue();
    }

    return false;
}

export class SkillQuest extends AbstractQuest {
    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.LOGIN,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnLogin(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.ENTER_STATE,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnEnterState(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.LEVELUP,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnLevelUp(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.LETTER })
    public async runOnLetter() {
        this.letter('Skill Quest');
    }

    private async onLetterDescribeQuest({ player }: { player: PlayerQuest }) {
        this.title('Skill Quest');
        this.text('Select one option: ');

        let option: number = 0;

        switch (true) {
            case player.isSura():
                option = await this.select(['Sword', 'Magic']);
                break;
            case player.isWarrior():
                option = await this.select(['Body', 'Mental']);
                break;
            case player.isAssassin():
                option = await this.select(['Dagger', 'Archer']);
                break;
            case player.isShaman():
                option = await this.select(['Buffer', 'Healer']);
                break;
        }

        this.addValue('skillGroup', option + 1);

        const npcVnum = this.getNpcSkillTeacher(option + 1);

        if (!npcVnum) return;

        this.sendTarget({ vnum: npcVnum, name: TARGET_NAME });

        this.clearLetter();

        return this.nextState(SkillQuestState.CONFIRM);
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.BUTTON })
    public async runOnLetterButton({ player }: ButtonExecutionContext) {
        return this.onLetterDescribeQuest({ player });
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.INFO })
    public async runOnLetterInfo({ player }: InfoExecutionContext) {
        return this.onLetterDescribeQuest({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: [...SKILL_TEACHER_BY_VNUM.keys()],
        with: ({ player, quest, npc }: ConditionFuncParams) => {
            const config = SKILL_TEACHER_BY_VNUM.get(npc.getId());
            if (!config) return false;

            return (
                playerMatchesJob(player, config.job) &&
                playerMatchesEmpire(player, config.empire) &&
                quest.getValue('skillGroup') == config.subjob
            );
        },
    })
    public async confirmOnClickSkillTeacher({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    private async askToConfirm({ player }: { player: PlayerQuest }) {
        this.title('Skill Quest');
        this.text('Do you want to confirm? Are you sure?');
        const option = await this.select(['Yes', 'No']);

        if (option === 0) {
            this.removeTarget({ name: TARGET_NAME });
            this.text('Thank you and congrats!!');
            player.setSkillGroup(this.getValue('skillGroup'));
            //TODO: give some rewards
            return this.nextState(SkillQuestState.START);
        }
    }
}
