import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ShopPacketValidator from './ShopPacketValidator';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';

// CG_SHOP is variable-length; the subheader decides the size:
// END(2), BUY(4), SELL(3), SELL2(4). We allocate for the largest.
export default class ShopPacket extends PacketIn {
    private shopSubHeader: ShopSubHeaderCG = ShopSubHeaderCG.END;
    private pos: number = 0;
    private count: number = 0;

    constructor() {
        super({
            header: PacketHeaderEnum.SHOP_IN,
            name: 'ShopPacket',
            size: 4,
            validator: ShopPacketValidator,
        });
    }

    getShopSubHeader(): ShopSubHeaderCG {
        return this.shopSubHeader;
    }

    getPos(): number {
        return this.pos;
    }

    getCount(): number {
        return this.count;
    }

    getFrameLength(buffer: Buffer): number | null {
        if (buffer.byteLength < 2) return null;

        switch (buffer[1] as ShopSubHeaderCG) {
            case ShopSubHeaderCG.BUY:
            case ShopSubHeaderCG.SELL2:
                return 4;
            case ShopSubHeaderCG.SELL:
                return 3;
            default:
                return 2;
        }
    }

    unpack(buffer: Buffer): this {
        this.bufferReader.setBuffer(buffer);
        this.shopSubHeader = this.bufferReader.readUInt8() as ShopSubHeaderCG;

        if (this.shopSubHeader === ShopSubHeaderCG.BUY) {
            this.bufferReader.readUInt8(); // unused padding byte
            this.pos = this.bufferReader.readUInt8();
        } else if (this.shopSubHeader === ShopSubHeaderCG.SELL) {
            this.pos = this.bufferReader.readUInt8();
        } else if (this.shopSubHeader === ShopSubHeaderCG.SELL2) {
            this.pos = this.bufferReader.readUInt8();
            this.count = this.bufferReader.readUInt8();
        }

        this.validate();
        return this;
    }
}
