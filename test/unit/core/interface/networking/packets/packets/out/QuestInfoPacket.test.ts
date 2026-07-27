import { expect } from 'chai';
import QuestInfoPacket from '@/core/interface/networking/packets/packet/out/QuestInfoPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { QuestFlagEnum } from '@/core/enum/QuestSendFlagEnum';

const BASIC_SIZE = 6; // header + size(2) + id(2) + flags
const IS_BEGIN_SIZE = 1;
const TITLE_SIZE = 31; // client reads char[30+1]
const COUNTER_NAME_SIZE = 17; // client reads char[16+1]
const INT_SIZE = 4;

describe('QuestInfoPacket', () => {
    it('should initialize with correct header', () => {
        const packet = new QuestInfoPacket({ id: 1, flags: 0, wasStarted: 0, title: 'Hunt Quest' });
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.QUEST_INFO);
        expect(packet.getName()).to.equal('QuestInfoPacket');
    });

    it('should declare a size equal to the bytes actually sent', () => {
        const packet = new QuestInfoPacket({
            id: 1,
            flags: QuestFlagEnum.ISBEGIN | QuestFlagEnum.TITLE,
            wasStarted: 1,
            title: 'Hunt Quest',
        });
        const buffer = packet.pack();
        const declaredSize = buffer.readUInt16LE(1);
        expect(buffer).to.have.lengthOf(declaredSize);
        expect(declaredSize).to.equal(BASIC_SIZE + IS_BEGIN_SIZE + TITLE_SIZE);
    });

    it('should only flag fields that are present in the payload', () => {
        const packet = new QuestInfoPacket({
            id: 2,
            flags: 0,
            wasStarted: 1,
            title: 'Hunt Quest',
            counterName: 'kills',
            counterValue: 5,
        });
        const buffer = packet.pack();
        const flags = buffer.readUInt8(5);

        // ISBEGIN was not requested, so the byte must not be flagged nor written
        expect(flags & QuestFlagEnum.ISBEGIN).to.equal(0);
        expect(flags & QuestFlagEnum.TITLE).to.equal(QuestFlagEnum.TITLE);
        expect(flags & QuestFlagEnum.COUNTER_NAME).to.equal(QuestFlagEnum.COUNTER_NAME);
        expect(flags & QuestFlagEnum.COUNTER_VALUE).to.equal(QuestFlagEnum.COUNTER_VALUE);
        expect(buffer).to.have.lengthOf(BASIC_SIZE + TITLE_SIZE + COUNTER_NAME_SIZE + INT_SIZE);
    });

    it('should write the title with the 31 bytes the client reads', () => {
        const packet = new QuestInfoPacket({ id: 3, flags: 0, wasStarted: 0, title: 'Hunt Quest' });
        const buffer = packet.pack();

        const title = buffer.subarray(BASIC_SIZE, BASIC_SIZE + TITLE_SIZE);
        expect(title.toString('ascii', 0, 10)).to.equal('Hunt Quest');
        expect(title[TITLE_SIZE - 1]).to.equal(0);
        expect(buffer).to.have.lengthOf(BASIC_SIZE + TITLE_SIZE);
    });

    it('should send a zero counter value instead of dropping the flagged field', () => {
        const packet = new QuestInfoPacket({
            id: 4,
            flags: 0,
            wasStarted: 1,
            title: 'Hunt Quest',
            counterValue: 0,
        });
        const buffer = packet.pack();
        const flags = buffer.readUInt8(5);

        expect(flags & QuestFlagEnum.COUNTER_VALUE).to.equal(QuestFlagEnum.COUNTER_VALUE);
        expect(buffer).to.have.lengthOf(BASIC_SIZE + TITLE_SIZE + INT_SIZE);
        expect(buffer.readUInt32LE(buffer.length - INT_SIZE)).to.equal(0);
    });
});
