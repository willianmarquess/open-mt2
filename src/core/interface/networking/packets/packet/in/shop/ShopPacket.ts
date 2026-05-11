import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ShopPacketValidator from './ShopPacketValidator';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';

// CG_SHOP is variable-length; maximum is END(2), BUY(3), SELL(3), SELL2(4).
// We allocate for the largest (4 bytes including header).
export default class ShopPacket extends PacketIn {
    private shopSubHeader: ShopSubHeaderCG;
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
