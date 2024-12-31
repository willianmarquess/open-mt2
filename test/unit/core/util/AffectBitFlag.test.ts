import AffectBitFlag from '@/core/util/AffectBitFlag';
import { expect } from 'chai';
describe('AffectBitFlag', () => {
    let affectFlag: AffectBitFlag;

    beforeEach(() => {
        affectFlag = new AffectBitFlag();
    });

    it('should initialize with all bits unset', () => {
        expect(affectFlag.isSet(1)).to.be.false;
        expect(affectFlag.isSet(32)).to.be.false;
        expect(affectFlag.isSet(33)).to.be.false;
        expect(affectFlag.isSet(64)).to.be.false;
    });

    it('should set a flag correctly', () => {
        affectFlag.set(1);
        expect(affectFlag.isSet(1)).to.be.true;

        affectFlag.set(33);
        expect(affectFlag.isSet(33)).to.be.true;
    });

    it('should reset a flag correctly', () => {
        affectFlag.set(1);
        affectFlag.reset(1);
        expect(affectFlag.isSet(1)).to.be.false;

        affectFlag.set(33);
        affectFlag.reset(33);
        expect(affectFlag.isSet(33)).to.be.false;
    });

    it('should toggle a flag correctly', () => {
        affectFlag.toggle(1);
        expect(affectFlag.isSet(1)).to.be.true;

        affectFlag.toggle(1);
        expect(affectFlag.isSet(1)).to.be.false;

        affectFlag.toggle(33);
        expect(affectFlag.isSet(33)).to.be.true;

        affectFlag.toggle(33);
        expect(affectFlag.isSet(33)).to.be.false;
    });

    it('should ignore flags outside the valid range', () => {
        affectFlag.set(0);
        affectFlag.set(65);
        expect(affectFlag.isSet(0)).to.be.false;
        expect(affectFlag.isSet(65)).to.be.false;

        affectFlag.reset(0);
        affectFlag.reset(65);
        expect(affectFlag.isSet(0)).to.be.false;
        expect(affectFlag.isSet(65)).to.be.false;
    });

    it('should return the correct flag values', () => {
        affectFlag.set(1);
        affectFlag.set(33);

        const [flags1, flags2] = affectFlag.getFlags();
        expect(flags1).to.equal(1);
        expect(flags2).to.equal(1);
    });

    it('should work with the constructor for initial values', () => {
        const initializedFlag = new AffectBitFlag(3, 5);

        expect(initializedFlag.isSet(1)).to.be.true;
        expect(initializedFlag.isSet(2)).to.be.true;
        expect(initializedFlag.isSet(33)).to.be.true;
        expect(initializedFlag.isSet(35)).to.be.true;
    });
});
