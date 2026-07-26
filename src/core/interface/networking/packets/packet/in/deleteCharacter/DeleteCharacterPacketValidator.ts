import PacketValidator from '../../../PacketValidator';
import DeleteCharacterPacket from './DeleteCharacterPacket';

export default class DeleteCharacterPacketValidator extends PacketValidator<DeleteCharacterPacket> {
    build() {
        this.createRule(this.packet.getSlot(), 'slot').isRequired().isNumber().isBetween(0, 3).build();
        this.createRule(this.packet.getPrivateCode(), 'privateCode').isRequired().isString().build();
    }
}
