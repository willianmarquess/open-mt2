import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name SetSkillGroupPacket
 * @header 0x70
 * @size 2
 * @description Tells the client which skill group (skill tree branch) the character has chosen. Matches the client struct TPacketGCChangeSkillGroup.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} skillGroup 1 Selected skill group, 0 means no group chosen yet
 */

export default class SetSkillGroupPacket extends PacketOut {
    private readonly skillGroup: number;

    constructor({ skillGroup }: { skillGroup: number }) {
        super({
            header: PacketHeaderEnum.SET_SKILL_GROUP,
            name: 'SetSkillGroupPacket',
            size: 2,
        });
        this.skillGroup = skillGroup;
    }

    pack() {
        this.bufferWriter.writeUint8(this.skillGroup);
        return this.bufferWriter.getBuffer();
    }
}
