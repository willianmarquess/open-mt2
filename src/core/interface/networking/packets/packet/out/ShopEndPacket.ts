import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

const PACKET_SIZE = 4;

/**
 * @packet
 * @type Out
 * @name ShopEndPacket
 * @header 0x26
 * @size 4
 * @description Is used to tell the client to close the shop window. Matches TPacketGCShop with subheader SHOP_SUBHEADER_GC_END (1).
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {short} size 2 Total packet size in bytes, including the header.
 *   - {byte} subheader 1 Shop subheader, always END (1). See ShopSubHeaderGC.
 */

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
