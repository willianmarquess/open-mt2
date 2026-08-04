import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';

const PACKET_SIZE = 4;

export type ShopResultPacketParams = {
    result: ShopSubHeaderGC;
};

/**
 * @packet
 * @type Out
 * @name ShopResultPacket
 * @header 0x26
 * @size 4
 * @description Is used to send the outcome of a shop operation to the client. Matches TPacketGCShop, the subheader carries the result code.
 * @fields
 *   - {byte} header 1 Packet header.
 *   - {short} size 2 Total packet size in bytes, including the header.
 *   - {byte} subheader 1 Result code: OK (4), NOT_ENOUGH_MONEY (5), INVENTORY_FULL (7), INVALID_POS (8), SOLD_OUT (9). See ShopSubHeaderGC.
 */

export default class ShopResultPacket extends PacketOut {
    private readonly result: ShopSubHeaderGC;

    constructor({ result }: ShopResultPacketParams) {
        super({ header: PacketHeaderEnum.SHOP_OUT, size: PACKET_SIZE, name: 'ShopResultPacket' });
        this.result = result;
    }

    pack(): Buffer {
        this.bufferWriter.writeUint16LE(PACKET_SIZE);
        this.bufferWriter.writeUint8(this.result);
        return this.bufferWriter.getBuffer();
    }
}
