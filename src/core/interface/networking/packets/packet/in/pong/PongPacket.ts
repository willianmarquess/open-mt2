import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';

/**
 * CG_PONG (header 254) — the client's header-only reply to the keepalive
 * GC_PING. Receiving it proves the client is still alive.
 */
export default class PongPacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.PONG,
            name: 'PongPacket',
            size: 1,
            sequenced: false,
        });
    }

    unpack() {
        return this;
    }
}
