import PacketValidator from '@/core/interface/networking/packets/PacketValidator';

// The client trails one sequence byte after most packets it sends; the original
// opts out per header, which is what `sequenced` mirrors.
const SEQUENCE_BYTE_LENGTH = 1;

export default abstract class Packet {
    protected header: number;
    protected subHeader?: number;
    protected size: number;
    protected name: string;
    protected sequenced: boolean;
    protected validator?: PacketValidator<this>;

    constructor({
        header,
        subHeader = 0,
        size,
        name,
        sequenced = true,
        validator = undefined,
    }: {
        header: number;
        subHeader?: number;
        size: number;
        name: string;
        sequenced?: boolean;
        validator?: new (packet: any) => PacketValidator<any>;
    }) {
        this.header = header;
        this.subHeader = subHeader;
        this.size = size;
        this.name = name;
        this.sequenced = sequenced;
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

    getSequenceLength() {
        return this.sequenced ? SEQUENCE_BYTE_LENGTH : 0;
    }

    /** On-wire bytes at the start of the buffer, or null when more are needed to tell. */
    getFrameLength(_buffer: Buffer): number | null {
        return this.size + this.getSequenceLength();
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
        return this.validator?.getFormattedErrorMessage() || 'Invalid packet';
    }

    validate() {
        if (!this.validator) throw new Error('No validator defined');
        this.validator.build();
    }

    createValidator(ValidatorClass: new (packet: this) => PacketValidator<this>): PacketValidator<this> {
        const validatorInstance = new ValidatorClass(this);
        if (!(validatorInstance instanceof PacketValidator)) {
            throw new TypeError('PacketValidator must be an instance of PacketValidator base class');
        }

        return validatorInstance;
    }
}
