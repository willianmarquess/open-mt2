import PacketValidator from '../../../PacketValidator';
import AuthTokenPacket from './AuthTokenPacket';

export default class AuthTokenPacketValidator extends PacketValidator<AuthTokenPacket> {
    constructor(authTokenPacket: AuthTokenPacket) {
        super(authTokenPacket);
    }

    build() {
        this.createRule(this.packet.getUsername(), 'username').isRequired().isString().build();
        this.createRule(this.packet.getKey(), 'key').isRequired().isNumber().isGreaterThan(0).build();
        this.createRule(this.packet.getXteaKeys(), 'xteaKeys').isRequired().isArray().build();
    }
}
