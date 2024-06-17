import PacketValidator from '../../../PacketValidator.js';

export default class HandshakePacketValidator extends PacketValidator {
    constructor(handshakePacket) {
        super(handshakePacket);
    }

    build() {
        this.createRule(this.packet.id, 'id').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.time, 'time').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.delta, 'delta').isRequired().isNumber().build();
    }
}
