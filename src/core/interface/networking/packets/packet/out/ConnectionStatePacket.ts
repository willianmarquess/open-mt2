import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name ConnectionStatePacket
 * @header 0xfd
 * @size 2
 * @description Is used to tell the client which phase the connection moved to. See in ConnectionStateEnum.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {byte} state 1 New phase of the connection
 */

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
