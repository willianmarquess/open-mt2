import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ItemDropPacketValidator from './ItemDropPacketValidator';

export default class ItemDropPacket extends PacketIn {
    private window: number;
    private position: number;
    private gold: number;
    private count: number;

    constructor({ window, position, gold, count }) {
        super({
            header: PacketHeaderEnum.ITEM_DROP,
            name: 'ItemDropPacket',
            size: 5,
            validator: ItemDropPacketValidator,
        });
        this.window = window;
        this.position = position;
        this.gold = gold;
        this.count = count;
    }

    getWindow() {
        return this.window;
    }

    getPosition() {
        return this.position;
    }

    getGold() {
        return this.gold;
    }

    getCount() {
        return this.count;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.window = this.bufferReader.readUInt8();
        this.position = this.bufferReader.readUInt16LE();
        this.gold = this.bufferReader.readUInt32LE();
        this.count = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
