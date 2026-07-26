import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

/**
 * Keepalive ping (GC_PING, header 44) sent periodically to every connection.
 * The client answers with CG_PONG (header 254). Header-only packet.
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
