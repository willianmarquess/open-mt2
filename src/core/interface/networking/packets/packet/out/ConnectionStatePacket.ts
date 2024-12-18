import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type ConnectionStatePacketParams = {
    state?: number;
};

export default class ConnectionStatePacket extends PacketOut {
    state;

    constructor({ state }: ConnectionStatePacketParams = {}) {
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
