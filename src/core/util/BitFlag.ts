export default class BitFlag {
    private flag: number;

    constructor(flag = 0) {
        this.flag = flag;
    }

    set(value: number) {
        this.flag |= value;
    }

    is(value: number) {
        return (this.flag & value) !== 0;
    }

    remove(value: number) {
        this.flag &= ~value;
    }

    toggle(value: number) {
        this.flag ^= value;
    }

    reset() {
        this.flag = 0;
    }

    getFlag() {
        // JS bitwise ops always produce a signed int32, so bit 31 (e.g. flag ordinal 32, like
        // AffectBitsTypeEnum.DISPEL) makes `flag` negative even though the bit pattern is the
        // unsigned DWORD the wire protocol expects. `>>> 0` reinterprets the same bits as unsigned
        // without changing which bits are set.
        return this.flag >>> 0;
    }
}
