import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class SkillLevelPacket extends PacketOut {
    private readonly skills: Array<{
        rank: number; //1 byte
        level: number; //1 byte
        timeToNextRead: number; //32 bytes
    }>;

    constructor({
        skills,
    }: {
        skills: Array<{
            rank: number;
            level: number;
            timeToNextRead: number;
        }>;
    }) {
        super({
            header: PacketHeaderEnum.SKILL_LEVEL,
            name: 'SkillLevelPacket',
            size: 1 + 255 * 6,
        });
        this.skills = skills;
    }

    pack() {
        this.skills.forEach((skill) => {
            this.bufferWriter.writeUint8(skill.rank);
            this.bufferWriter.writeUint8(skill.level);
            this.bufferWriter.writeInt32LE(skill.timeToNextRead);
        });
        return this.bufferWriter.getBuffer();
    }
}
