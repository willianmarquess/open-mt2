import PacketValidator from '../../../PacketValidator';
import InternalPingPacket from './InternalPingPacket';

export default class InternalPingPacketValidator extends PacketValidator<InternalPingPacket> {
    constructor(targetPacket: InternalPingPacket) {
        super(targetPacket);
    }

    build() {
        this.createRule(this.packet.getTime(), 'time').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
