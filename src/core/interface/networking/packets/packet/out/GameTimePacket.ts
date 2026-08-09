import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name GameTimePacket
 * @header 0x6a
 * @size 5
 * @description Sends the current server time so the client can sync its own clock. Matches the client struct TPacketGCTime.
 * @fields
 *   - {byte} header 1 Packet header
 *   - {int} time 4 Server time as a unix timestamp in seconds (client time_t)
 */

export default class GameTimePacket extends PacketOut {
    private readonly time: number;

    constructor({ time }: { time: number }) {
        super({
            header: PacketHeaderEnum.GAME_TIME,
            name: 'GameTimePacket',
            size: 5,
        });
        this.time = time;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.time);
        return this.bufferWriter.getBuffer();
    }
}
