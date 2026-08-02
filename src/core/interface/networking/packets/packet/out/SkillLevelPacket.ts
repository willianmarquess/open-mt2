import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const PLAYER_SKILL_SIZE = 6;
const SKILL_MAX_NUM = 255;

/**
 * @packet
 * @type Out
 * @name SkillLevelPacket
 * @header 0x4c
 * @size 1531
 * @description Sends the level of every skill slot to the client; the 6 byte skill entry (masterType, level, nextReadTime) repeats SKILL_MAX_NUM = 255 times, so 1 + 255 * 6 = 1531 bytes. Matches the client struct TPacketGCSkillLevelNew with TPlayerSkill entries.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} masterType 1 Mastery stage of the skill, always 0 here. Repeated 255 times as part of the skill entry
 *   - {byte} level 1 Current level of the skill, clamped to 0-255. Repeated 255 times as part of the skill entry
 *   - {int} nextReadTime 4 Timestamp when the skill book may be read again, always 0 here. Repeated 255 times as part of the skill entry
 */

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
