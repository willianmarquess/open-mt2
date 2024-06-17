import PacketValidator from '../../../PacketValidator.js';

export default class EmpirePacketValidator extends PacketValidator {
    constructor(empirePacket) {
        super(empirePacket);
    }

    build() {
        this.createRule(this.packet.empireId, 'empireId').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
