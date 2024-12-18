import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketBidirectional from "../PacketBidirectional";
import HandshakePacketValidator from "./HandshakePacketValidator";

export default class HandshakePacket extends PacketBidirectional {
    private id: number;
    private time: number;
    private delta: number;

    constructor({ id, time, delta }) {
        super({
            header: PacketHeaderEnum.HANDSHAKE,
            name: 'HandshakePacket',
            size: 13,
            validator: HandshakePacketValidator,
        });
        this.id = id;
        this.time = time;
        this.delta = delta;
    }

    getDelta() {
        return this.delta;
    }

    getTime() {
        return this.time;
    }

    getId() {
        return this.id;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.id).writeUint32LE(this.time).writeUint32LE(this.delta);
        return this.bufferWriter.getBuffer();
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.id = this.bufferReader.readUInt32LE();
        this.time = this.bufferReader.readUInt32LE();
        this.delta = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
