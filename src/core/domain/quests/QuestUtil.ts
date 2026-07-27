import { EmpireEnum } from '@/core/enum/EmpireEnum';
import { JobEnum } from '@/core/enum/JobEnum';
import { AssasinSubJobEnum, ShamanSubJobEnum, SuraSubJobEnum, WarriorSubJobEnum } from '@/core/enum/SubJobEnum';

const TeacherByRaceMapper = {
    [JobEnum.WARRIOR_MALE]: {
        [WarriorSubJobEnum.BODY]: {
            [EmpireEnum.RED]: 20300,
            [EmpireEnum.YELLOW]: 20320,
            [EmpireEnum.BLUE]: 20340,
        },
        [WarriorSubJobEnum.MENTAL]: {
            [EmpireEnum.RED]: 20301,
            [EmpireEnum.YELLOW]: 20321,
            [EmpireEnum.BLUE]: 20341,
        },
    },
    [JobEnum.WARRIOR_FEMALE]: {
        [WarriorSubJobEnum.BODY]: {
            [EmpireEnum.RED]: 20300,
            [EmpireEnum.YELLOW]: 20320,
            [EmpireEnum.BLUE]: 20340,
        },
        [WarriorSubJobEnum.MENTAL]: {
            [EmpireEnum.RED]: 20301,
            [EmpireEnum.YELLOW]: 20321,
            [EmpireEnum.BLUE]: 20341,
        },
    },
    [JobEnum.ASSASSIN_MALE]: {
        [AssasinSubJobEnum.DAGGER]: {
            [EmpireEnum.RED]: 20302,
            [EmpireEnum.YELLOW]: 20322,
            [EmpireEnum.BLUE]: 20342,
        },
        [AssasinSubJobEnum.ARCHER]: {
            [EmpireEnum.RED]: 20303,
            [EmpireEnum.YELLOW]: 20323,
            [EmpireEnum.BLUE]: 20343,
        },
    },
    [JobEnum.ASSASSIN_FEMALE]: {
        [AssasinSubJobEnum.DAGGER]: {
            [EmpireEnum.RED]: 20302,
            [EmpireEnum.YELLOW]: 20322,
            [EmpireEnum.BLUE]: 20342,
        },
        [AssasinSubJobEnum.ARCHER]: {
            [EmpireEnum.RED]: 20303,
            [EmpireEnum.YELLOW]: 20323,
            [EmpireEnum.BLUE]: 20343,
        },
    },
    [JobEnum.SURA_MALE]: {
        [SuraSubJobEnum.SWORD]: {
            [EmpireEnum.RED]: 20304,
            [EmpireEnum.YELLOW]: 20324,
            [EmpireEnum.BLUE]: 20344,
        },
        [SuraSubJobEnum.MAGIC]: {
            [EmpireEnum.RED]: 20305,
            [EmpireEnum.YELLOW]: 20325,
            [EmpireEnum.BLUE]: 20345,
        },
    },
    [JobEnum.SURA_FEMALE]: {
        [SuraSubJobEnum.SWORD]: {
            [EmpireEnum.RED]: 20304,
            [EmpireEnum.YELLOW]: 20324,
            [EmpireEnum.BLUE]: 20344,
        },
        [SuraSubJobEnum.MAGIC]: {
            [EmpireEnum.RED]: 20305,
            [EmpireEnum.YELLOW]: 20325,
            [EmpireEnum.BLUE]: 20345,
        },
    },
    [JobEnum.SHAMAN_MALE]: {
        [ShamanSubJobEnum.BUFFER]: {
            [EmpireEnum.RED]: 20306,
            [EmpireEnum.YELLOW]: 20326,
            [EmpireEnum.BLUE]: 20346,
        },
        [ShamanSubJobEnum.HEALER]: {
            [EmpireEnum.RED]: 20307,
            [EmpireEnum.YELLOW]: 20327,
            [EmpireEnum.BLUE]: 20347,
        },
    },
    [JobEnum.SHAMAN_FEMALE]: {
        [ShamanSubJobEnum.BUFFER]: {
            [EmpireEnum.RED]: 20306,
            [EmpireEnum.YELLOW]: 20326,
            [EmpireEnum.BLUE]: 20346,
        },
        [ShamanSubJobEnum.HEALER]: {
            [EmpireEnum.RED]: 20307,
            [EmpireEnum.YELLOW]: 20327,
            [EmpireEnum.BLUE]: 20347,
        },
    },
};

export class QuestUtil {
    private static nextId: number = 0;

    public static getNextId() {
        return this.nextId++;
    }

    public static getNpcSkillTeacher(
        playerJob: JobEnum,
        playerSubJob: WarriorSubJobEnum | ShamanSubJobEnum | SuraSubJobEnum | AssasinSubJobEnum,
        playerEmpire: EmpireEnum,
    ) {
        return TeacherByRaceMapper[playerJob]?.[playerSubJob]?.[playerEmpire] || null;
    }
}
