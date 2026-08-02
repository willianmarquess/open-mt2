import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const PLAYER_SKILL_SIZE = 6;
const SKILL_MAX_NUM = 255;

export default class SkillLevelPacket extends PacketOut {
    private readonly skills: Array<{
        rank: number;
        level: number;
        timeToNextRead: number;
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
            size: 1 + SKILL_MAX_NUM * PLAYER_SKILL_SIZE,
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
