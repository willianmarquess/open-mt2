import PacketValidator from '../../../PacketValidator.js';

export default class TargetPacketValidator extends PacketValidator {
    constructor(TargetPacket) {
        super(TargetPacket);
    }

    build() {
        this.createRule(this.packet.targetVirtualId, 'targetVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
