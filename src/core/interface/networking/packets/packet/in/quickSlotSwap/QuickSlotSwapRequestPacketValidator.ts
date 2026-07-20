import PacketValidator from '../../../PacketValidator';
import QuickSlotSwapRequestPacket from './QuickSlotSwapRequestPacket';

export default class QuickSlotSwapRequestPacketValidator extends PacketValidator<QuickSlotSwapRequestPacket> {
    constructor(quickSlotSwapRequestPacket: QuickSlotSwapRequestPacket) {
        super(quickSlotSwapRequestPacket);
    }

    build() {
        this.createRule(this.packet.getSlotA(), 'slotA').isRequired().isNumber().isBetween(0, 36).build();
        this.createRule(this.packet.getSlotB(), 'slotB').isRequired().isNumber().isBetween(0, 36).build();
    }
}
