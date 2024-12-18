import PacketValidator from '../../../PacketValidator';
import CreateCharacterPacket from './CreateCharacterPacket';

export default class CreateCharacterPacketValidator extends PacketValidator<CreateCharacterPacket> {
    build() {
        this.createRule(this.packet.getSlot(), 'slot').isRequired().isNumber().isBetween(0, 3).build();
        this.createRule(this.packet.getPlayerName(), 'playerName').isRequired().isString().build();
        this.createRule(this.packet.getPlayerClass(), 'playerClass')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getAppearance(), 'appearance')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
