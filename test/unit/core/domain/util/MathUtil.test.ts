import { expect } from 'chai';
import MathUtil from '@/core/domain/util/MathUtil';

describe('MathUtil', () => {
    it('should return MAX_UINT', () => {
        expect(MathUtil.MAX_UINT).to.equal(1e9);
    });

    it('should return MAX_TINY', () => {
        expect(MathUtil.MAX_TINY).to.equal(255);
    });

    it('should calculate distance between two points', () => {
        const distance = MathUtil.calcDistance(0, 0, 3, 4);
        expect(distance).to.equal(5);
    });

    it('should calculate rotation from direction', () => {
        const rotation = MathUtil.calcRotationFromDirection(1);
        expect(rotation).to.equal(0);
    });

    it('should calculate random rotation if direction is 0', () => {
        const rotation = MathUtil.calcRotationFromDirection(0);
        expect(rotation % 45).to.equal(0);
    });

    it('should convert to unsigned number', () => {
        expect(MathUtil.toUnsignedNumber(123)).to.equal(123);
        expect(MathUtil.toUnsignedNumber(-123)).to.equal(0);
        expect(MathUtil.toUnsignedNumber('123')).to.equal(123);
        expect(MathUtil.toUnsignedNumber('abc')).to.equal(0);
    });

    it('should convert to number', () => {
        expect(MathUtil.toNumber(123)).to.equal(123);
        expect(MathUtil.toNumber('123')).to.equal(123);
        expect(MathUtil.toNumber('abc')).to.equal(0);
    });

    it('should generate random integer between min and max', () => {
        const min = 1;
        const max = 10;
        const randomInt = MathUtil.getRandomInt(min, max);
        expect(randomInt).to.be.at.least(min);
        expect(randomInt).to.be.at.most(max);
    });
});
