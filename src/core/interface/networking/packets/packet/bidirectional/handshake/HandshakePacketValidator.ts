import PacketValidator from "../../../PacketValidator";
import HandshakePacket from "./HandshakePacket";

export default class HandshakePacketValidator extends PacketValidator<HandshakePacket> {
    build() {
        this.createRule(this.packet.getId(), 'id').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getTime(), 'time').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getDelta(), 'delta').isRequired().isNumber().build();
    }
}
