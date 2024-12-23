import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import HandshakePacket from '@/core/interface/networking/packets/packet/bidirectional/handshake/HandshakePacket';

describe('HandshakePacket', function () {
    let handshakePacket;

    beforeEach(function () {
        handshakePacket = new HandshakePacket({ id: 1, time: 123456789, delta: 500 });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(handshakePacket.header).to.equal(PacketHeaderEnum.HANDSHAKE);
        expect(handshakePacket.name).to.equal('HandshakePacket');
        expect(handshakePacket.size).to.equal(13);
    });

    it('should initialize properties correctly', function () {
        expect(handshakePacket.id).to.equal(1);
        expect(handshakePacket.time).to.equal(123456789);
        expect(handshakePacket.delta).to.equal(500);
    });

    it('should pack data correctly', function () {
        const packedBuffer = handshakePacket.pack();
        expect(packedBuffer.readUInt32LE(1)).to.equal(1);
        expect(packedBuffer.readUInt32LE(5)).to.equal(123456789);
        expect(packedBuffer.readUInt32LE(9)).to.equal(500);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(13);
        buffer.writeUInt8(PacketHeaderEnum.HANDSHAKE, 0);
        buffer.writeUInt32LE(1, 1);
        buffer.writeUInt32LE(123456789, 5);
        buffer.writeUInt32LE(500, 9);

        const unpackedPacket = new HandshakePacket({ id: 0, time: 0, delta: 0 });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getId()).to.equal(1);
        expect(unpackedPacket.getTime()).to.equal(123456789);
        expect(unpackedPacket.getDelta()).to.equal(500);
    });
});
