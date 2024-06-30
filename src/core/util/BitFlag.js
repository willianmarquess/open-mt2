export default class BitFlag {
    #flag;

    constructor(flag = 0) {
        this.#flag = flag;
    }

    set(value) {
        this.#flag |= value;
    }

    is(value) {
        return (this.#flag & value) !== 0;
    }

    remove(value) {
        this.#flag &= ~value;
    }

    toggle(value) {
        this.#flag ^= value;
    }

    get flag() {
        return this.#flag;
    }
}
