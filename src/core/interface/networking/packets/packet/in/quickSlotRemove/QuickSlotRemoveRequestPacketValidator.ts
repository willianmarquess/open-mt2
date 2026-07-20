import PacketValidator from '../../../PacketValidator';
import QuickSlotRemoveRequestPacket from './QuickSlotRemoveRequestPacket';

export default class QuickSlotRemoveRequestPacketValidator extends PacketValidator<QuickSlotRemoveRequestPacket> {
    constructor(quickSlotRemoveRequestPacket: QuickSlotRemoveRequestPacket) {
        super(quickSlotRemoveRequestPacket);
    }

    build() {
        this.createRule(this.packet.getSlot(), 'slot').isRequired().isNumber().isBetween(0, 36).build();
    }
}
