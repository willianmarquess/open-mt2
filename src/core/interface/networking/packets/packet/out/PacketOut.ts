import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import Packet from '../Packet';

export default abstract class PacketOut extends Packet {
    protected readonly bufferWriter: BufferWriter;

    constructor({ header, size, name }: { header: number; size: number; name: string }) {
        super({ header, size, name });
        this.bufferWriter = new BufferWriter(this.header, this.size);
    }

    abstract pack(): Buffer;
}
