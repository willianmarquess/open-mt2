import MathUtil from '../../../../../../domain/util/MathUtil.js';
import PacketValidator from '../../../PacketValidator.js';

export default class ItemDropPacketValidator extends PacketValidator {
    constructor(itemDropPacket) {
        super(itemDropPacket);
    }

    build() {
        this.createRule(this.packet.window, 'window').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.position, 'position').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.gold, 'gold').isRequired().isNumber().isBetween(0, MathUtil.MAX_UINT).build();
        this.createRule(this.packet.count, 'count').isRequired().isNumber().isBetween(0, MathUtil.MAX_TINY).build();
    }
}
