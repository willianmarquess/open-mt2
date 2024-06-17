import PacketValidator from '../../../PacketValidator.js';

export default class LoginRequestPacketValidator extends PacketValidator {
    constructor(loginRequestPacket) {
        super(loginRequestPacket);
    }

    build() {
        this.createRule(this.packet.username, 'username').isRequired().isString().build();
        this.createRule(this.packet.password, 'password').isRequired().isString().build();
        this.createRule(this.packet.key, 'key').isRequired().isNumber().build();
    }
}
