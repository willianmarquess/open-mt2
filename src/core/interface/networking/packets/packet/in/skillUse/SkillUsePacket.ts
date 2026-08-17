import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import SkillUsePacketValidator from './SkillUsePacketValidator';

export default class SkillUsePacket extends PacketIn {
    private skillNum: number;
    private targetVirtualId: number;

    constructor({ skillNum, targetVirtualId }: { skillNum: number; targetVirtualId: number }) {
        super({
            header: PacketHeaderEnum.SKILL_USE,
            name: 'SkillUsePacket',
            size: 9,
            validator: SkillUsePacketValidator,
        });
        this.skillNum = skillNum;
        this.targetVirtualId = targetVirtualId;
    }

    getSkillNum() {
        return this.skillNum;
    }

    getTargetVirtualId() {
        return this.targetVirtualId;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.skillNum = this.bufferReader.readUInt32LE();
        this.targetVirtualId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
