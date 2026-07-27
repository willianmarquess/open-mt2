import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const SKILL_MAX_NUM = 255;
// TPlayerSkill lives inside the client's #pragma pack(1) region: BYTE
// bMasterType, BYTE bLevel, 32-bit time_t — 6 bytes, no alignment padding.
// (An oversized packet goes unnoticed because the client silently skips
// zero bytes between packets, but every level lands at a wrong offset.)
const PLAYER_SKILL_SIZE = 6;

export const SKILL_HORSE = 130;

export default class SkillLevelPacket extends PacketOut {
    private readonly levels: Array<number> = new Array(SKILL_MAX_NUM).fill(0);

    constructor() {
        super({
            header: PacketHeaderEnum.SKILL_LEVEL,
            name: 'SkillLevelPacket',
            size: 1 + SKILL_MAX_NUM * PLAYER_SKILL_SIZE,
        });
    }

    setSkillLevel(skill: number, level: number): void {
        if (skill < 0 || skill >= SKILL_MAX_NUM) return;
        this.levels[skill] = Math.max(0, Math.min(255, level));
    }

    pack(): Buffer {
        for (let skill = 0; skill < SKILL_MAX_NUM; skill += 1) {
            this.bufferWriter.writeUint8(0);
            this.bufferWriter.writeUint8(this.levels[skill]);
            this.bufferWriter.writeUint32LE(0);
        }

        return this.bufferWriter.getBuffer();
    }
}
