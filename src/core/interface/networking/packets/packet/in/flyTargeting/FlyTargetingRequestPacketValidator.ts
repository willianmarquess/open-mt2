import PacketValidator from '../../../PacketValidator';
import FlyTargetingRequestPacket from './FlyTargetingRequestPacket';

export default class FlyTargetingRequestPacketValidator extends PacketValidator<FlyTargetingRequestPacket> {
    build() {
        this.createRule(this.packet.getTargetVirtualId(), 'targetVirtualId')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getPositionX(), 'positionX')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
        this.createRule(this.packet.getPositionY(), 'positionY')
            .isRequired()
            .isNumber()
            .isGreaterThanOrEqual(0)
            .build();
    }
}
