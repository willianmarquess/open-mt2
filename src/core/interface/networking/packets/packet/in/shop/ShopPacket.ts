import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ShopPacketValidator from './ShopPacketValidator';
import { ShopSubHeaderCG } from '@/core/enum/ShopSubHeaderEnum';

const SHOP_BODY_SIZE_DEFAULT = 2;
const SHOP_BODY_SIZE: Partial<Record<ShopSubHeaderCG, number>> = {
    [ShopSubHeaderCG.BUY]: 4,
    [ShopSubHeaderCG.SELL]: 3,
    [ShopSubHeaderCG.SELL2]: 4,
};

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

        const body = SHOP_BODY_SIZE[buffer[1] as ShopSubHeaderCG] ?? SHOP_BODY_SIZE_DEFAULT;

        return body + this.getSequenceLength();
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
