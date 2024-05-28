const job = {
    WARRIOR_MALE: 0,
    WARRIOR_FEMALE: 4,
    ASSASSIN_MALE: 1,
    ASSASSIN_FEMALE: 5,
    SURA_MALE: 2,
    SURA_FEMALE: 6,
    SHAMAN_MALE: 3,
    SHAMAN_FEMALE: 7,
};

const jobFromClassId = {
    [job.WARRIOR_MALE]: 0,
    [job.WARRIOR_FEMALE]: 0,
    [job.ASSASSIN_MALE]: 1,
    [job.ASSASSIN_FEMALE]: 1,
    [job.SURA_MALE]: 2,
    [job.SURA_FEMALE]: 2,
    [job.SHAMAN_MALE]: 3,
    [job.SHAMAN_FEMALE]: 3,
};

const classNameFromClassId = {
    [job.WARRIOR_MALE]: 'warrior',
    [job.WARRIOR_FEMALE]: 'warrior',
    [job.ASSASSIN_MALE]: 'assassin',
    [job.ASSASSIN_FEMALE]: 'assassin',
    [job.SURA_MALE]: 'sura',
    [job.SURA_FEMALE]: 'sura',
    [job.SHAMAN_MALE]: 'shaman',
    [job.SHAMAN_FEMALE]: 'shaman',
};

export default class JobUtil {
    static getClassNameFromClassId(classId) {
        return classNameFromClassId[classId] || classNameFromClassId[job.WARRIOR_MALE];
    }

    static getJobIdFromClassId(classId) {
        return jobFromClassId[classId] || jobFromClassId[job.WARRIOR_MALE];
    }
}
