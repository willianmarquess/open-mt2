import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import AttackPacketValidator from './AttackPacketValidator.js';

export default class AttackPacket extends PacketIn {
    #attackType;
    #victimVirtualId;
    #unknown1 = 0;
    #unknown2 = 0;

    constructor({ attackType, victimVirtualId } = {}) {
        super({
            header: PacketHeaderEnum.ATTACK,
            name: 'AttackPacket',
            size: 8,
            validator: AttackPacketValidator,
        });
        this.#attackType = attackType;
        this.#victimVirtualId = victimVirtualId;
    }

    get attackType() {
        return this.#attackType;
    }
    get victimVirtualId() {
        return this.#victimVirtualId;
    }
    get unknown1() {
        return this.#unknown1;
    }
    get unknown2() {
        return this.#unknown2;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#attackType = this.bufferReader.readUInt8();
        this.#victimVirtualId = this.bufferReader.readUInt32LE();
        this.#unknown1 = this.bufferReader.readUInt8();
        this.#unknown2 = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
