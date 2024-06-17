import PacketValidator from '../PacketValidator.js';

export default class Packet {
    #header;
    #subHeader;
    #size;
    #name;
    #validator;

    constructor({ header, subHeader, size, name, validator }) {
        this.#header = header;
        this.#subHeader = subHeader;
        this.#size = size;
        this.#name = name;
        if (validator) {
            this.#validator = this.#createValidator(validator);
        }
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

    isValid() {
        return this.#validator.isValid();
    }

    errors() {
        return this.#validator.getErrors();
    }

    validate() {
        this.#validator.build();
    }

    #createValidator(validator) {
        const validatorInstance = new validator(this);
        if (!(validatorInstance instanceof PacketValidator)) {
            throw new Error('PacketValidator must be an instance of PacketValidator base class');
        }

        return validatorInstance;
    }
}
