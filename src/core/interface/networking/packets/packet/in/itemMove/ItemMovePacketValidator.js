import PacketValidator from '../../../PacketValidator.js';

export default class ItemMovePacketValidator extends PacketValidator {
    constructor(itemMovePacket) {
        super(itemMovePacket);
    }

    build() {
        this.createRule(this.packet.fromWindow, 'fromWindow').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.fromPosition, 'fromPosition')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.toWindow, 'toWindow').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.toPosition, 'toPosition').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.count, 'count').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
