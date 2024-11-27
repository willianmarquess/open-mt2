import PacketValidator from '../../../PacketValidator.js';

export default class AttackPacketValidator extends PacketValidator {
    constructor(AttackPacket) {
        super(AttackPacket);
    }

    build() {
        this.createRule(this.packet.attackType, 'attackType').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.victimVirtualId, 'victimVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
