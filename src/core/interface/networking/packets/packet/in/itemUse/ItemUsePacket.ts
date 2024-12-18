import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import ItemUsePacketValidator from "./ItemUsePacketValidator";

export default class ItemUsePacket extends PacketIn {
    private window: number;
    private position: number;

    constructor({ window, position }) {
        super({
            header: PacketHeaderEnum.ITEM_USE,
            name: 'ItemUsePacket',
            size: 5,
            validator: ItemUsePacketValidator,
        });
        this.window = window;
        this.position = position;
    }

    getWindow() {
        return this.window;
    }

    getPosition() {
        return this.position;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.window = this.bufferReader.readUInt8();
        this.position = this.bufferReader.readUInt16LE();
        this.validate();
        return this;
    }
}
