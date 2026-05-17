import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import QuestAnswerPacketValidator from './QuestAnswerPacketValidator';

export default class QuestAnswerPacket extends PacketIn {
    private answer: number;

    constructor({ answer }: { answer: number }) {
        super({
            header: PacketHeaderEnum.QUEST_ANSWER,
            name: 'QuestAnswerPacket',
            size: 2,
            validator: QuestAnswerPacketValidator,
        });
        this.answer = answer;
    }

    getAnswer() {
        return this.answer;
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.answer = this.bufferReader.readUInt8();
        this.validate();
        return this;
    }
}
