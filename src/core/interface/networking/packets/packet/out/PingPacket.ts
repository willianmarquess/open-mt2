import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * @packet
 * @type Out
 * @name PingPacket
 * @header 0x2c
 * @size 1
 * @description Keepalive ping (GC_PING, header 44) sent periodically to every connection; the client answers with CG_PONG (header 254). Header-only packet, matches the client struct TPacketGCPing.
 * @fields
 *   - {byte} header 1 Packet header
 */

export default class PingPacket extends PacketOut {
    constructor() {
        super({
            header: PacketHeaderEnum.PING,
            name: 'PingPacket',
            size: 1,
        });
    }

    pack() {
        return this.bufferWriter.getBuffer();
    }
}
