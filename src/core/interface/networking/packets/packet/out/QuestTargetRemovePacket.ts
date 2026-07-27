import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class QuestTargetRemovePacket extends PacketOut {
    private readonly id: number;

    constructor({ id }: { id: number }) {
        super({
            header: PacketHeaderEnum.QUEST_TARGET_REMOVE,
            name: 'QuestTargetRemovePacket',
            size: 5,
        });
        this.id = id;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.id);
        return this.bufferWriter.getBuffer();
    }
}
