import PacketValidator from '../../../PacketValidator.js';

export default class AuthTokenPacketValidator extends PacketValidator {
    constructor(authTokenPacket) {
        super(authTokenPacket);
    }

    build() {
        this.createRule(this.packet.username, 'username').isRequired().isString().build();
        this.createRule(this.packet.key, 'key').isRequired().isNumber().isGreaterThan(0).build();
        this.createRule(this.packet.xteaKeys, 'xteaKeys').isRequired().isArray().build();
    }
}
