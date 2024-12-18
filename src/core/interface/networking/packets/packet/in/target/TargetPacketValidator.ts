import PacketValidator from '../../../PacketValidator';
import TargetPacket from './TargetPacket';

export default class TargetPacketValidator extends PacketValidator<TargetPacket> {
    constructor(targetPacket: TargetPacket) {
        super(targetPacket);
    }

    build() {
        this.createRule(this.packet.getTargetVirtualId(), 'targetVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
