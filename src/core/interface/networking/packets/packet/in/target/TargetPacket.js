import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import TargetPacketValidator from './TargetPacketValidator.js';

export default class TargetPacket extends PacketIn {
    #targetVirtualId;

    constructor({ targetVirtualId } = {}) {
        super({
            header: PacketHeaderEnum.TARGET,
            name: 'TargetPacket',
            size: 5,
            validator: TargetPacketValidator,
        });
        this.#targetVirtualId = targetVirtualId;
    }

    get targetVirtualId() {
        return this.#targetVirtualId;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#targetVirtualId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
