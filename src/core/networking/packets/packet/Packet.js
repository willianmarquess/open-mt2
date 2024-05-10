export default class Packet {
    #header;
    #subHeader;
    #size;
    #name;

    constructor({ header, subHeader, size, name }) {
        this.#header = header;
        this.#subHeader = subHeader;
        this.#size = size;
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

    get size() {
        return this.#size;
    }

    haveSubHeader() {
        return !!this.#subHeader && this.#subHeader > 0;
    }
}
