import PacketValidator from '../../../PacketValidator';
import AddFlyTargetingRequestPacket from './AddFlyTargetingRequestPacket';

export default class AddFlyTargetingRequestPacketValidator extends PacketValidator<AddFlyTargetingRequestPacket> {
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
