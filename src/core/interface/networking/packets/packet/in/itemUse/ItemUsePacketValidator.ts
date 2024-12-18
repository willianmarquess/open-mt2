import PacketValidator from "../../../PacketValidator";
import ItemUsePacket from "./ItemUsePacket";

export default class ItemUsePacketValidator extends PacketValidator<ItemUsePacket> {
    build() {
        this.createRule(this.packet.getWindow(), 'window').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getPosition(), 'position').isRequired().isNumber().isGreaterThanOrEqual(0).build();
    }
}
