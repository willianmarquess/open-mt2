import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name QuestTargetCreatePacket
 * @header 0x7d
 * @size 43
 * @description Used to create a quest target on the client minimap and, when the target is a character, the target effect in the world. Matches the 43-byte TPacketGCTargetCreateNew client struct.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} id 4 Identifier of the target, reused later to update or remove it
 *   - {string} targetName 33 Name of the target (ascii)
 *   - {int} targetVirtualId 4 Virtual id of the entity the target is attached to
 *   - {byte} type 1 Kind of target: 0 none, 1 location, 2 character
 */

export default class QuestTargetCreatePacket extends PacketOut {
    private readonly id: number;
    private readonly targetName: string;
    private readonly targetVirtualId: number;
    private readonly type: number;

    constructor({
        id,
        targetName,
        targetVirtualId,
        type,
    }: {
        id: number;
        targetName: string;
        targetVirtualId: number;
        type: number;
    }) {
        super({
            header: PacketHeaderEnum.QUEST_TARGET_CREATE,
            name: 'QuestTargetCreatePacket',
            size: 43,
        });
        this.id = id;
        this.targetName = targetName.substring(0, 32);
        this.targetVirtualId = targetVirtualId;
        this.type = type;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.id);
        this.bufferWriter.writeString(this.targetName, 33);
        this.bufferWriter.writeUint32LE(this.targetVirtualId);
        this.bufferWriter.writeUint8(this.type);
        return this.bufferWriter.getBuffer();
    }
}
