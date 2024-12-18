import MathUtil from "@/core/domain/util/MathUtil";
import PacketValidator from "../../../PacketValidator";
import ItemDropPacket from "./ItemDropPacket";

export default class ItemDropPacketValidator extends PacketValidator<ItemDropPacket> {
    build() {
        this.createRule(this.packet.getWindow(), 'window').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getPosition(), 'position').isRequired().isNumber().isGreaterThanOrEqual(0).build();
        this.createRule(this.packet.getGold(), 'gold').isRequired().isNumber().isBetween(0, MathUtil.MAX_UINT).build();
        this.createRule(this.packet.getCount(), 'count').isRequired().isNumber().isBetween(0, MathUtil.MAX_TINY).build();
    }
}
