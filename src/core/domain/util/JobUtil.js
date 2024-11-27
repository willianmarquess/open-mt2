import ClassEnum from '../../enum/ClassEnum.js';
import JobEnum from '../../enum/JobEnum.js';

const jobFromClassId = {
    [JobEnum.WARRIOR_MALE]: ClassEnum.WARRIOR,
    [JobEnum.WARRIOR_FEMALE]: ClassEnum.WARRIOR,
    [JobEnum.ASSASSIN_MALE]: ClassEnum.ASSASSIN,
    [JobEnum.ASSASSIN_FEMALE]: ClassEnum.ASSASSIN,
    [JobEnum.SURA_MALE]: ClassEnum.SURA,
    [JobEnum.SURA_FEMALE]: ClassEnum.SURA,
    [JobEnum.SHAMAN_MALE]: ClassEnum.SHAMAN,
    [JobEnum.SHAMAN_FEMALE]: ClassEnum.SHAMAN,
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
