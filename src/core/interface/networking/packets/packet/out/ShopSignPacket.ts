import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';
import { PRIVATE_SHOP_SIGN_MAX_LEN } from '@/core/domain/shop/PrivateShop';

// Packet structure (little-endian, #pragma pack(1)):
//  [1B header=0x27][4B ownerVid][33B sign (null-terminated)]
//
// Total: 1 + 4 + 33 = 38 bytes
//
// HEADER_GC_SHOP_SIGN = 39 (0x27)
// Sent to all players in the area when a private shop opens or closes.
// When closing, sign is an empty string ("").

const SIGN_FIELD_LEN = PRIVATE_SHOP_SIGN_MAX_LEN + 1; // 33 bytes incl. null terminator
const PACKET_SIZE = 1 + 4 + SIGN_FIELD_LEN; // 38 bytes

export type ShopSignPacketParams = {
    ownerVid: number;
    /** Shop sign text. Empty string signals the shop is closed. */
    sign: string;
};

export default class ShopSignPacket extends PacketOut {
    private readonly ownerVid: number;
    private readonly sign: string;

    constructor({ ownerVid, sign }: ShopSignPacketParams) {
        super({ header: PacketHeaderEnum.PLAYER_SHOP_OUT, size: PACKET_SIZE, name: 'ShopSignPacket' });
        this.ownerVid = ownerVid;
        this.sign = sign.slice(0, PRIVATE_SHOP_SIGN_MAX_LEN);
    }

    pack(): Buffer {
        this.bufferWriter.writeUint32LE(this.ownerVid);
        // writeString writes at most (length-1) chars then null-pads to fill `length` bytes
        this.bufferWriter.writeString(this.sign, SIGN_FIELD_LEN);
        return this.bufferWriter.getBuffer();
    }
}
