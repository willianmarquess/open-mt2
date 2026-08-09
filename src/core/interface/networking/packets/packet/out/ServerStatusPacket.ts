import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type ServerStatusPacketParams = {
    status?: Array<{
        port: number;
        status: number;
    }>;
    isSuccess?: boolean;
};

/**
 * @packet
 * @type Out
 * @name ServerStatusPacket
 * @header 0xd2
 * @size 9
 * @description Answers the client channel status request; the 3 byte channel entry (port, status) repeats once per channel and the declared size of 9 only fits the default single channel.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} size 4 Value produced by calcSize(), 6 + 3 per channel. See notes, the client reads this as a channel count
 *   - {short} port 2 Channel port. Repeated once per channel entry
 *   - {byte} status 1 Channel status flag, 1 means online. Repeated once per channel entry
 *   - {byte} isSuccess 1 Trailing success flag written after the channel entries. The client never reads it
 */

export default class ServerStatusPacket extends PacketOut {
    private readonly status: Array<{
        port: number;
        status: number;
    }>;
    private readonly isSuccess: number;

    constructor({
        status = [
            {
                port: 0,
                status: 1,
            },
        ],
        isSuccess = true,
    }: ServerStatusPacketParams = {}) {
        super({
            header: PacketHeaderEnum.SERVER_STATUS,
            name: 'ServerStatusPacket',
            size: 9, //fixed for now
        });
        this.status = status;
        this.isSuccess = isSuccess ? 1 : 0;
    }

    calcSize() {
        return 6 + this.status.length * 3;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.calcSize());
        this.status.forEach((s) => {
            this.bufferWriter.writeUint16LE(s.port).writeUint8(s.status);
        });
        this.bufferWriter.writeUint8(this.isSuccess);
        return this.bufferWriter.getBuffer();
    }
}
