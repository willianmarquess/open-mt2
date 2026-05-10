import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

// [1B header][2B size][1B subheader=result] — total 4 bytes
const PACKET_SIZE = 4;

export type ShopResultPacketParams = {
    result: ShopSubHeaderGC;
};

export default class ShopResultPacket extends PacketOut {
    private readonly result: ShopSubHeaderGC;

    constructor({ result }: ShopResultPacketParams) {
        super({ header: PacketHeaderEnum.GC_SHOP, size: PACKET_SIZE, name: 'ShopResultPacket' });
        this.result = result;
    }

    pack(): Buffer {
        this.bufferWriter.writeUint16LE(PACKET_SIZE);
        this.bufferWriter.writeUint8(this.result);
        return this.bufferWriter.getBuffer();
    }
}
