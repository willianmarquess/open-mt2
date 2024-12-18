import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";
import ItemMovePacketValidator from "./ItemMovePacketValidator";

export default class ItemMovePacket extends PacketIn {
    private fromWindow: number;
    private fromPosition: number;
    private toWindow: number;
    private toPosition: number;
    private count: number;

    constructor({ fromWindow, fromPosition, toWindow, toPosition, count }) {
        super({
            header: PacketHeaderEnum.ITEM_MOVE,
            name: 'ItemMovePacket',
            size: 9,
            validator: ItemMovePacketValidator,
        });
        this.fromWindow = fromWindow;
        this.fromPosition = fromPosition;
        this.toWindow = toWindow;
        this.toPosition = toPosition;
        this.count = count;
    }

    getFromWindow() {
        return this.fromWindow;
    }

    getFromPosition() {
        return this.fromPosition;
    }

    getToWindow() {
        return this.toWindow;
    }

    getToPosition() {
        return this.toPosition;
    }

    getCount() {
        return this.count;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.fromWindow = this.bufferReader.readUInt8();
        this.fromPosition = this.bufferReader.readUInt16LE();
        this.toWindow = this.bufferReader.readUInt8();
        this.toPosition = this.bufferReader.readUInt16LE();
        this.count = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
