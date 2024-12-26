import { expect } from 'chai';
import JobUtil from '@/core/domain/util/JobUtil';
import { JobEnum } from '@/core/enum/JobEnum';

describe('JobUtil', () => {
    it('should return correct class name from class ID', () => {
        expect(JobUtil.getClassNameFromClassId(JobEnum.WARRIOR_MALE)).to.equal('warrior');
        expect(JobUtil.getClassNameFromClassId(JobEnum.ASSASSIN_FEMALE)).to.equal('assassin');
        expect(JobUtil.getClassNameFromClassId(JobEnum.SURA_MALE)).to.equal('sura');
        expect(JobUtil.getClassNameFromClassId(JobEnum.SHAMAN_FEMALE)).to.equal('shaman');
    });

    it('should return default class name for invalid class ID', () => {
        expect(JobUtil.getClassNameFromClassId(-1 as JobEnum)).to.equal('warrior');
    });

    it('should return correct job ID from class ID', () => {
        expect(JobUtil.getJobIdFromClassId(JobEnum.WARRIOR_MALE)).to.equal(0);
        expect(JobUtil.getJobIdFromClassId(JobEnum.ASSASSIN_FEMALE)).to.equal(1);
        expect(JobUtil.getJobIdFromClassId(JobEnum.SURA_MALE)).to.equal(2);
        expect(JobUtil.getJobIdFromClassId(JobEnum.SHAMAN_FEMALE)).to.equal(3);
    });

    it('should return default job ID for invalid class ID', () => {
        expect(JobUtil.getJobIdFromClassId(-1 as JobEnum)).to.equal(0);
    });
});
