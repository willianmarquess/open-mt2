import PacketValidator from '@/core/interface/networking/packets/PacketValidator';
import ShopPacket from './ShopPacket';

export default class ShopPacketValidator extends PacketValidator<ShopPacket> {
    constructor(packet: ShopPacket) {
        super(packet);
    }

    build() {
        this.createRule(this.packet.getShopSubHeader(), 'shopSubHeader').isRequired().isNumber().build();
    }
}
