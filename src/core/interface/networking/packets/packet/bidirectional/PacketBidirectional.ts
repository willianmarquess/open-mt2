import BufferReader from "../../../buffer/BufferReader";
import BufferWriter from "../../../buffer/BufferWriter";
import Packet from "../Packet";

export default abstract class PacketBidirectional extends Packet {
    protected readonly bufferWriter: BufferWriter;
    protected readonly bufferReader: BufferReader;

    constructor({ header, subHeader = 0, size, name, validator }) {
        super({ header, subHeader, size, name, validator });
        this.bufferWriter = new BufferWriter(this.header, this.size);
        this.bufferReader = new BufferReader();
    }

    abstract pack();
    abstract unpack(buffer: Buffer);
}
