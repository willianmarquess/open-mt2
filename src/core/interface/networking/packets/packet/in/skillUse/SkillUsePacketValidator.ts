import PacketValidator from '../../../PacketValidator';
import SkillUsePacket from './SkillUsePacket';

export default class SkillUsePacketValidator extends PacketValidator<SkillUsePacket> {
    constructor(SkillUsePacket: SkillUsePacket) {
        super(SkillUsePacket);
    }

    build() {
        this.createRule(this.packet.getSkillNum(), 'skillNum').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getTargetVirtualId(), 'targetVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
