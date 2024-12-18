import PacketValidator from "../../../PacketValidator";
import AttackPacket from "./AttackPacket";

export default class AttackPacketValidator extends PacketValidator<AttackPacket> {
    constructor(attackPacket: AttackPacket) {
        super(attackPacket);
    }

    build() {
        this.createRule(this.packet.getAttackType(), 'attackType').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getVictimVirtualId(), 'victimVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
