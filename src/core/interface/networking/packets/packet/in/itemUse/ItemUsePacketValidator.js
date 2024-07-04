import PacketValidator from '../../../PacketValidator.js';

export default class ItemUsePacketValidator extends PacketValidator {
    constructor(itemUsePacket) {
        super(itemUsePacket);
    }

    build() {
        this.createRule(this.packet.window, 'window').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.position, 'position').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
