import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name CharacterDiedPacket
 * @header 0x0e
 * @size 5
 * @description Used to notify the client when some entity has died.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {number} virtualId 4 virtualId of the dead entity
 */

export default class CharacterDiedPacket extends PacketOut {
    private virtualId: number;

    constructor({ virtualId }) {
        super({
            header: PacketHeaderEnum.CHARACTER_DIED,
            name: 'CharacterDiedPacket',
            size: 5,
        });
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        return this.bufferWriter.getBuffer();
    }
}
