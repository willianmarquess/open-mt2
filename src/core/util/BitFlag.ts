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

    getFlag() {
        return this.flag;
    }
}
