import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

// [1B header][2B size][1B subheader=END] — total 4 bytes
const PACKET_SIZE = 4;

export default class ShopEndPacket extends PacketOut {
    constructor() {
        super({ header: PacketHeaderEnum.SHOP_OUT, size: PACKET_SIZE, name: 'ShopEndPacket' });
    }

    pack(): Buffer {
        this.bufferWriter.writeUint16LE(PACKET_SIZE);
        this.bufferWriter.writeUint8(ShopSubHeaderGC.END);
        return this.bufferWriter.getBuffer();
    }
}
