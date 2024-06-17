import PacketValidator from '../../../PacketValidator.js';

export default class CharacterMovePacketValidator extends PacketValidator {
    constructor(characterMovePacket) {
        super(characterMovePacket);
    }

    build() {
        this.createRule(this.packet.movementType, 'movementType')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.arg, 'arg').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.rotation, 'rotation').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.positionX, 'positionX').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.positionY, 'positionY').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.time, 'time').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
