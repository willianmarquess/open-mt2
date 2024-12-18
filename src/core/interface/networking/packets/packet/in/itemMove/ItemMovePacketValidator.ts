import PacketValidator from '../../../PacketValidator';
import ItemMovePacket from './ItemMovePacket';

export default class ItemMovePacketValidator extends PacketValidator<ItemMovePacket> {
    build() {
        this.createRule(this.packet.getFromWindow(), 'fromWindow')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getFromPosition(), 'fromPosition')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getToWindow(), 'toWindow').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getToPosition(), 'toPosition')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getCount(), 'count').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
