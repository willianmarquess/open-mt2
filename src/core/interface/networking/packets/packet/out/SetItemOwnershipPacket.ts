import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

const PLAYER_NAME_MAX_LENGTH = 25;

export default class SetItemOwnershipPacket extends PacketOut {
    private virtualId: number;
    private ownerName: string;

    constructor({ ownerName, virtualId }: { ownerName: string; virtualId: number }) {
        super({
            header: PacketHeaderEnum.SET_ITEM_OWNERSHIP,
            name: 'SetItemOwnershipPacket',
            size: 5 + PLAYER_NAME_MAX_LENGTH,
        });
        this.virtualId = virtualId;
        this.ownerName = ownerName || '\0';
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.virtualId);
        this.bufferWriter.writeString(this.ownerName, PLAYER_NAME_MAX_LENGTH);
        return this.bufferWriter.getBuffer();
    }
}
