import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import ItemPickupPacketValidator from "./ItemPickupPacketValidator";

export default class ItemPickupPacket extends PacketIn {
    private virtualId: number;

    constructor({ virtualId }) {
        super({
            header: PacketHeaderEnum.ITEM_PICKUP,
            name: 'ItemPickupPacket',
            size: 5,
            validator: ItemPickupPacketValidator,
        });
        this.virtualId = virtualId;
    }

    getVirtualId() {
        return this.virtualId;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.virtualId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
