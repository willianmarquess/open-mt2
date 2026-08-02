import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name QuestTargetRemovePacket
 * @header 0x7c
 * @size 5
 * @description Used to remove a quest target from the client minimap and drop its target effect.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} id 4 Identifier of the target to remove, the same one sent in QuestTargetCreatePacket
 */

export default class QuestTargetRemovePacket extends PacketOut {
    private readonly id: number;

    constructor({ id }: { id: number }) {
        super({
            header: PacketHeaderEnum.QUEST_TARGET_REMOVE,
            name: 'QuestTargetRemovePacket',
            size: 5,
        });
        this.id = id;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.id);
        return this.bufferWriter.getBuffer();
    }
}
