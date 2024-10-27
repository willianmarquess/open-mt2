import { expect } from 'chai';
import ChatInPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/in/chat/ChatInPacket.js';
import PacketHeaderEnum from '../../../../../../../../../src/core/enum/PacketHeaderEnum.js';

describe('ChatInPacket', function () {
    let chatInPacket;

    beforeEach(function () {
        chatInPacket = new ChatInPacket({
            message: 'Hello, world!',
            messageType: 1,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(chatInPacket.header).to.equal(PacketHeaderEnum.CHAT_IN);
        expect(chatInPacket.name).to.equal('ChatInPacket');
        expect(chatInPacket.size).to.equal(5 + 'Hello, world!'.length + 1);
    });

    it('should initialize properties correctly', function () {
        expect(chatInPacket.message).to.equal('Hello, world!');
        expect(chatInPacket.messageType).to.equal(1);
    });

    it('should unpack data correctly', function () {
        const message = 'Unpacked message';
        const buffer = Buffer.alloc(20);
        buffer.writeUInt8(0, 0); // header
        buffer.writeUInt16LE(100, 1); // ignored data
        buffer.writeUInt8(10, 3); // messageType
        buffer.write(`${message}\0`, 4, 'ascii'); // message

        const unpackedPacket = new ChatInPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.messageType).to.equal(10);
        expect(unpackedPacket.message).to.equal('Unpacked message');
    });
});
