import PacketValidator from '../../../PacketValidator.js';

export default class ItemPickupPacketValidator extends PacketValidator {
    constructor(itemPickupPacket) {
        super(itemPickupPacket);
    }

    build() {
        this.createRule(this.packet.virtualId, 'virtualId').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
