import PacketValidator from '../../../PacketValidator';
import CharacterMovePacket from './CharacterMovePacket';

export default class CharacterMovePacketValidator extends PacketValidator<CharacterMovePacket> {
    build() {
        this.createRule(this.packet.getMovementType(), 'movementType')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getArg(), 'arg').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getRotation(), 'rotation').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getPositionX(), 'positionX')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getPositionY(), 'positionY')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getTime(), 'time').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
