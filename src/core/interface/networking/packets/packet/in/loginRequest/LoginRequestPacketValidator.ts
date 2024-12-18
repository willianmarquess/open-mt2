import PacketValidator from "../../../PacketValidator";
import LoginRequestPacket from "./LoginRequestPacket";

export default class LoginRequestPacketValidator extends PacketValidator<LoginRequestPacket> {
    constructor(loginRequestPacket: LoginRequestPacket) {
        super(loginRequestPacket);
    }

    build() {
        this.createRule(this.packet.getUsername(), 'username').isRequired().isString().build();
        this.createRule(this.packet.getPassword(), 'password').isRequired().isString().build();
        this.createRule(this.packet.getKey(), 'key').isRequired().isNumber().build();
    }
}
