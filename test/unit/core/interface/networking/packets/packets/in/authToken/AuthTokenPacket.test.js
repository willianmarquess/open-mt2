import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../../../../src/core/enum/PacketHeaderEnum.js';
import AuthTokenPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/in/authToken/AuthTokenPacket.js';

describe('AuthTokenPacket', function () {
    let authTokenPacket;

    beforeEach(function () {
        authTokenPacket = new AuthTokenPacket({
            username: 'testuser',
            key: 1234567890,
            xteaKeys: [1, 2, 3, 4],
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(authTokenPacket.header).to.equal(PacketHeaderEnum.TOKEN);
        expect(authTokenPacket.name).to.equal('AuthTokenPacket');
        expect(authTokenPacket.size).to.equal(52);
    });

    it('should initialize properties correctly', function () {
        expect(authTokenPacket.username).to.equal('testuser');
        expect(authTokenPacket.key).to.equal(1234567890);
        expect(authTokenPacket.xteaKeys).to.deep.equal([1, 2, 3, 4]);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(52);
        buffer.writeUint8(0, 0);
        buffer.write('testuser\0', 1, 'ascii');
        buffer.writeUInt32LE(1234567890, 32);
        buffer.writeUInt32LE(1, 36);
        buffer.writeUInt32LE(2, 40);
        buffer.writeUInt32LE(3, 44);
        buffer.writeUInt32LE(4, 48);

        const unpackedPacket = new AuthTokenPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.username).to.equal('testuser');
        expect(unpackedPacket.key).to.equal(1234567890);
        expect(unpackedPacket.xteaKeys).to.deep.equal([1, 2, 3, 4]);
    });
});
