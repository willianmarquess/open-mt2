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

    describe('getRandomInt over a wide range (issue #158)', () => {
        it('should reach more than 256 distinct values', () => {
            const seen = new Set<number>();
            for (let i = 0; i < 4000; i++) seen.add(MathUtil.getRandomInt(1, 50_000));

            expect(seen.size, 'a single byte can only produce 256 outcomes').to.be.greaterThan(256);
        });

        it('should not turn a 1-in-50000 chance into 1-in-256', () => {
            let hits = 0;
            for (let i = 0; i < 20_000; i++) if (MathUtil.getRandomInt(1, 50_000) === 1) hits++;

            expect(hits, 'a one-byte draw would hit about 78 times in 20000').to.be.lessThan(10);
        });

        it('should produce values that are not all multiples of range/256', () => {
            const step = Math.floor(4_000_001 / 256);
            let offGrid = 0;
            for (let i = 0; i < 500; i++) if ((MathUtil.getRandomInt(1, 4_000_001) - 1) % step !== 0) offGrid++;

            expect(offGrid, 'a scaled byte can only land on the grid').to.be.greaterThan(400);
        });
    });

    describe('getRandomInt bounds (issue #158)', () => {
        it('should accept a non-integer max, as the drop range is', () => {
            const range = (4_000_000 * 100) / 103;

            expect(() => MathUtil.getRandomInt(1, range + 1)).to.not.throw();
            expect(MathUtil.getRandomInt(1, range + 1)).to.be.at.most(Math.floor(range + 1));
        });

        it('should return min when the range is empty or inverted', () => {
            expect(MathUtil.getRandomInt(5, 5)).to.equal(5);
            expect(MathUtil.getRandomInt(5, 3)).to.equal(5);
        });

        it('should still honour a negative range', () => {
            for (let i = 0; i < 200; i++) {
                const value = MathUtil.getRandomInt(-90, 90);
                expect(value).to.be.at.least(-90);
                expect(value).to.be.at.most(90);
            }
        });
    });
});
