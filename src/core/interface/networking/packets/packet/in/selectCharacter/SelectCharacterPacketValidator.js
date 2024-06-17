import PacketValidator from '../../../PacketValidator.js';

export default class SelectCharacterPacketValidator extends PacketValidator {
    constructor(selectCharacterPacket) {
        super(selectCharacterPacket);
    }

    build() {
        this.createRule(this.packet.slot, 'slot').isRequired().isNumber().isBetween(0, 3).build();
    }
}
