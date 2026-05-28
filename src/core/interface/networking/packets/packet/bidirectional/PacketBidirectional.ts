import BufferReader from '../../../buffer/BufferReader';
import BufferWriter from '../../../buffer/BufferWriter';
import PacketValidator from '../../PacketValidator';
import Packet from '../Packet';

export default abstract class PacketBidirectional extends Packet {
    protected readonly bufferWriter: BufferWriter;
    protected readonly bufferReader: BufferReader;

    constructor({
        header,
        subHeader = 0,
        size,
        name,
        validator,
    }: {
        header: number;
        subHeader?: number;
        size: number;
        name: string;
        validator?: new (packet: any) => PacketValidator<any>;
    }) {
        super({ header, subHeader, size, name, validator });
        this.bufferWriter = new BufferWriter(this.header, this.size);
        this.bufferReader = new BufferReader();
    }

    abstract pack(): Buffer;
    abstract unpack(buffer: Buffer): this;
}
