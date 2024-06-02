import JobEnum from '../../enum/JobEnum.js';

const jobFromClassId = {
    [JobEnum.WARRIOR_MALE]: 0,
    [JobEnum.WARRIOR_FEMALE]: 0,
    [JobEnum.ASSASSIN_MALE]: 1,
    [JobEnum.ASSASSIN_FEMALE]: 1,
    [JobEnum.SURA_MALE]: 2,
    [JobEnum.SURA_FEMALE]: 2,
    [JobEnum.SHAMAN_MALE]: 3,
    [JobEnum.SHAMAN_FEMALE]: 3,
};

const classNameFromClassId = {
    [JobEnum.WARRIOR_MALE]: 'warrior',
    [JobEnum.WARRIOR_FEMALE]: 'warrior',
    [JobEnum.ASSASSIN_MALE]: 'assassin',
    [JobEnum.ASSASSIN_FEMALE]: 'assassin',
    [JobEnum.SURA_MALE]: 'sura',
    [JobEnum.SURA_FEMALE]: 'sura',
    [JobEnum.SHAMAN_MALE]: 'shaman',
    [JobEnum.SHAMAN_FEMALE]: 'shaman',
};

export default class JobUtil {
    static getClassNameFromClassId(classId) {
        return classNameFromClassId[classId] || classNameFromClassId[JobEnum.WARRIOR_MALE];
    }

    static getJobIdFromClassId(classId) {
        return jobFromClassId[classId] || jobFromClassId[JobEnum.WARRIOR_MALE];
    }
}
