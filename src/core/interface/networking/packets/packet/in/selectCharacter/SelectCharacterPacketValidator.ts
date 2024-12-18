import PacketValidator from '../../../PacketValidator';
import SelectCharacterPacket from './SelectCharacterPacket';

export default class SelectCharacterPacketValidator extends PacketValidator<SelectCharacterPacket> {
    constructor(selectCharacterPacket: SelectCharacterPacket) {
        super(selectCharacterPacket);
    }

    build() {
        this.createRule(this.packet.getSlot(), 'slot').isRequired().isNumber().isBetween(0, 3).build();
    }
}
