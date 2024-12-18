import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

type ItemDroppedHidePacketParams = {
    virtualId?: number;
};

export default class ItemDroppedHidePacket extends PacketOut {
    private virtualId: number;

    constructor({ virtualId }: ItemDroppedHidePacketParams = {}) {
        super({
            header: PacketHeaderEnum.ITEM_DROPPED_HIDE,
            name: 'ItemDroppedHidePacket',
            size: 21,
        });
        this.virtualId = virtualId;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        return this.bufferWriter.getBuffer();
    }
}
