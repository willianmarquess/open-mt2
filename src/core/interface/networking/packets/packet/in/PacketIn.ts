import BufferReader from '../../../buffer/BufferReader';
import Packet from '../Packet';

export default abstract class PacketIn extends Packet {
    protected readonly bufferReader = new BufferReader();

    abstract unpack(buffer: Buffer): this;
}
