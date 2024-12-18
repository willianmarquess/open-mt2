import PacketValidator from '../../../PacketValidator';
import ItemPickupPacket from './ItemPickupPacket';

export default class ItemPickupPacketValidator extends PacketValidator<ItemPickupPacket> {
    build() {
        this.createRule(this.packet.getVirtualId(), 'virtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
