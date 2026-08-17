import PacketValidator from '../../../PacketValidator';
import ShootPacket from './ShootPacket';

export default class ShootPacketValidator extends PacketValidator<ShootPacket> {
    build() {
        this.createRule(this.packet.getType(), 'type').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
