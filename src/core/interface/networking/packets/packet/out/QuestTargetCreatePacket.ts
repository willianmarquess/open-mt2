import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketOut from '@/core/interface/networking/packets/packet/out/PacketOut';

export default class QuestTargetCreatePacket extends PacketOut {
    private readonly id: number;
    private readonly targetName: string;
    private readonly targetVirtualId: number;
    private readonly type: number;

    constructor({
        id,
        targetName,
        targetVirtualId,
        type,
    }: {
        id: number;
        targetName: string;
        targetVirtualId: number;
        type: number;
    }) {
        super({
            header: PacketHeaderEnum.QUEST_TARGET_CREATE,
            name: 'QuestTargetCreatePacket',
            size: 51,
        });
        this.id = id;
        this.targetName = targetName.substring(0, 32);
        this.targetVirtualId = targetVirtualId;
        this.type = type;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.id);
        this.bufferWriter.writeString(this.targetName, 33);
        this.bufferWriter.writeUint32LE(this.targetVirtualId);
        this.bufferWriter.writeUint8(this.type);
        return this.bufferWriter.getBuffer();
    }
}
