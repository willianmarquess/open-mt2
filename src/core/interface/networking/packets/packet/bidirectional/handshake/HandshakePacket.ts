import PacketHeaderEnum from "../../../../../../enum/PacketHeaderEnum.js";
import PacketBidirectional from "../PacketBidirectional.js";
import HandshakePacketValidator from "./HandshakePacketValidator.js";

export default class HandshakePacket extends PacketBidirectional {
  private id;
  private time;
  private delta;

  constructor(id: number, time: number, delta: number) {
    super({
      header: PacketHeaderEnum.HANDSHAKE,
      name: "HandshakePacket",
      size: 13,
      validator: HandshakePacketValidator,
    });
    this.id = id;
    this.time = time;
    this.delta = delta;
  }

  get delta() {
    return this.delta;
  }

  get time() {
    return this.time;
  }

  get id() {
    return this.id;
  }

  pack() {
    this.bufferWriter.writeUint32LE(this.id).writeUint32LE(this.time).writeUint32LE(this.delta);
    console.log("HandshakePacket", this.bufferWriter.buffer);
    return this.bufferWriter.buffer;
  }

  unpack(buffer) {
    this.bufferReader.setBuffer(buffer);
    this.id = this.bufferReader.readUInt32LE();
    this.time = this.bufferReader.readUInt32LE();
    this.delta = this.bufferReader.readUInt32LE();
    this.validate();
    return this;
  }
}
