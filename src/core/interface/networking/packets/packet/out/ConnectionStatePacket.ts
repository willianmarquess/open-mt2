import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class ConnectionStatePacket extends PacketOut {
    private readonly state: number;

    constructor({ state }: { state: number }) {
        super({
            header: PacketHeaderEnum.CONNECTION_STATE,
            name: 'ConnectionStatePacket',
            size: 2,
        });
        this.state = state;
    }

    pack() {
        this.bufferWriter.writeUint8(this.state);
        return this.bufferWriter.getBuffer();
    }
}
