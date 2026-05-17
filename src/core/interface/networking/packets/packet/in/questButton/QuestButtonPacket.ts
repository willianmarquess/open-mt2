import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import QuestButtonPacketValidator from './QuestButtonPacketValidator';

export default class QuestButtonPacket extends PacketIn {
    private questId: number;

    constructor({ questId }: { questId: number }) {
        super({
            header: PacketHeaderEnum.QUEST_BUTTON,
            name: 'QuestButtonPacket',
            size: 5,
            validator: QuestButtonPacketValidator,
        });
        this.questId = questId;
    }

    getQuestId() {
        return this.questId;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.questId = this.bufferReader.readUInt32LE();
        this.validate();
        return this;
    }
}
