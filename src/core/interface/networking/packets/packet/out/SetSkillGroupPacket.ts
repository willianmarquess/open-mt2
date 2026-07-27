import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

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
