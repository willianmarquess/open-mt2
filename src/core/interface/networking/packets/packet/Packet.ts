import PacketValidator from '@/core/interface/networking/packets/PacketValidator';

export default abstract class Packet {
    protected header: number;
    protected subHeader?: number;
    protected size: number;
    protected name: string;
    protected validator?: PacketValidator<this>;

    constructor({ header, subHeader = 0, size, name, validator = undefined }) {
        this.header = header;
        this.subHeader = subHeader;
        this.size = size;
        this.name = name;
        if (validator) {
            this.validator = this.createValidator(validator);
        }
    }

    getName() {
        return this.name;
    }

    getHeader() {
        return this.header;
    }

    getSubHeader() {
        return this.subHeader;
    }

    getSize() {
        return this.size;
    }

    haveSubHeader() {
        return !!this.subHeader && this.subHeader > 0;
    }

    isValid() {
        if (!this.validator) return false;
        return this.validator.isValid();
    }

    errors() {
        if (!this.validator) return [];
        return this.validator.getErrors();
    }

    getErrorMessage() {
        return this.validator.getFormattedErrorMessage();
    }

    validate() {
        if (!this.validator) throw new Error('No validator defined');
        this.validator.build();
    }

    createValidator(ValidatorClass: new (packet: this) => PacketValidator<this>): PacketValidator<this> {
        const validatorInstance = new ValidatorClass(this);
        if (!(validatorInstance instanceof PacketValidator)) {
            throw new Error('PacketValidator must be an instance of PacketValidator base class');
        }

        return validatorInstance;
    }
}
