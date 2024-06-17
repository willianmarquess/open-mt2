import PacketValidator from '../../../PacketValidator.js';

export default class CreateCharacterPacketValidator extends PacketValidator {
    constructor(createCharacterPacket) {
        super(createCharacterPacket);
    }

    build() {
        this.createRule(this.packet.slot, 'slot').isRequired().isNumber().isBetween(0, 3).build();
        this.createRule(this.packet.playerName, 'playerName').isRequired().isString().build();
        this.createRule(this.packet.playerClass, 'playerClass').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.appearance, 'appearance').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
