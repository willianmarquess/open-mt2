import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import ChatInPacket from '@/core/interface/networking/packets/packet/in/chat/ChatInPacket';
import { expect } from 'chai';

describe('ChatInPacket', function () {
    let chatInPacket: ChatInPacket;

    beforeEach(function () {
        chatInPacket = new ChatInPacket({
            message: 'Hello, world!',
            messageType: 1,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(chatInPacket.getHeader()).to.equal(PacketHeaderEnum.CHAT_IN);
        expect(chatInPacket.getName()).to.equal('ChatInPacket');
        expect(chatInPacket.getSize()).to.equal(5 + 'Hello, world!'.length + 1);
    });

    it('should initialize properties correctly', function () {
        expect(chatInPacket.getMessage()).to.equal('Hello, world!');
        expect(chatInPacket.getMessageType()).to.equal(1);
    });

    it('should unpack data correctly', function () {
        const message = 'Unpacked message';
        const buffer = Buffer.alloc(20);
        buffer.writeUInt8(0, 0);
        buffer.writeUInt16LE(100, 1);
        buffer.writeUInt8(10, 3);
        buffer.write(`${message}\0`, 4, 'ascii');

        const unpackedPacket = new ChatInPacket({
            message: '',
            messageType: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getMessageType()).to.equal(10);
        expect(unpackedPacket.getMessage()).to.equal('Unpacked message');
    });
});
