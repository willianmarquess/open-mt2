export default class Packager {
    #header;
    #subHeader;
    #length;
    #name;

    constructor({ header, subHeader, length, name }) {
        this.#header = header;
        this.#subHeader = subHeader;
        this.#length = length;
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    get header() {
        return this.#header;
    }

    get subHeader() {
        return this.#subHeader;
    }

    get length() {
        return this.#length;
    }

    haveSubHeader() {
        return !!this.#subHeader && this.#subHeader > 0;
    }

    pack() {
        throw new Error('this method must be overwritten');
    }

    unpack() {
        throw new Error('this method must be overwritten');
    }
}
