import PacketValidator from '../../../PacketValidator';
import EmpirePacket from './EmpirePacket';

export default class EmpirePacketValidator extends PacketValidator<EmpirePacket> {
    build() {
        this.createRule(this.packet.getEmpireId(), 'empireId').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
