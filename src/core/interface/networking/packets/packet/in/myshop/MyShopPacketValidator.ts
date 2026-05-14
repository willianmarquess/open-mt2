import PacketValidator from '@/core/interface/networking/packets/PacketValidator';
import MyShopPacket from './MyShopPacket';

export default class MyShopPacketValidator extends PacketValidator<MyShopPacket> {
    constructor(packet: MyShopPacket) {
        super(packet);
    }

    build() {
        this.createRule(this.packet.getSign(), 'sign').isRequired().isString().build();
    }
}
