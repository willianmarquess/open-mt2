import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type FlyPacketParams = {
    type?: number;
    fromVirtualId?: number;
    toVirtualId?: number;
};

/**
 * @packet
 * @type Out
 * @name FlyPacket
 * @header 0x46
 * @size 10
 * @description Used to send fly particle from entity to another.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} type 4 type of fly. See in FlyEnum.
 *   - {number} fromVirtualId 4 wich entity the fly starts
 *   - {number} toVirtualId 4 wich entity the fly ends
 */

export default class FlyPacket extends PacketOut {
    private type: number;
    private fromVirtualId: number;
    private toVirtualId: number;

    constructor({ type, fromVirtualId, toVirtualId }: FlyPacketParams = {}) {
        super({
            header: PacketHeaderEnum.FLY,
            name: 'FlyPacket',
            size: 10,
        });
        this.type = type;
        this.fromVirtualId = fromVirtualId;
        this.toVirtualId = toVirtualId;
    }

    pack() {
        this.bufferWriter.writeUint8(this.type);
        this.bufferWriter.writeUint32LE(this.fromVirtualId);
        this.bufferWriter.writeUint32LE(this.toVirtualId);
        return this.bufferWriter.getBuffer();
    }
}
