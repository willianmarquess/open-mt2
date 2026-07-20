import PacketValidator from '../../../PacketValidator';
import QuickSlotAddRequestPacket from './QuickSlotAddRequestPacket';
import { QuickSlotTypeEnum } from '@/core/enum/QuickSlotTypeEnum';

export default class QuickSlotAddRequestPacketValidator extends PacketValidator<QuickSlotAddRequestPacket> {
    constructor(quickSlotAddRequestPacket: QuickSlotAddRequestPacket) {
        super(quickSlotAddRequestPacket);
    }

    build() {
        this.createRule(this.packet.getSlot(), 'slot').isRequired().isNumber().isBetween(0, 36).build();
        this.createRule(this.packet.getType(), 'type')
            .isRequired()
            .isNumber()
            .isInEnum(Object.values(QuickSlotTypeEnum))
            .build();
        this.createRule(this.packet.getPosition(), 'position').isRequired().isNumber().isBetween(0, 89).build();
    }
}
