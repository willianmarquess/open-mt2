import { expect } from 'chai';
import AuthTokenPacket from '../../../../../../../../src/core/interface/networking/packets/packet/in/AuthTokenPacket.js';
import PacketHeaderEnum from '../../../../../../../../src/core/enum/PacketHeaderEnum.js';

describe('AuthTokenPacket', function () {
    let authTokenPacket;

    beforeEach(function () {
        authTokenPacket = new AuthTokenPacket({
            username: 'testuser',
            key: 1234567890,
            Xteakeys: [1, 2, 3, 4],
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(authTokenPacket.header).to.equal(PacketHeaderEnum.TOKEN);
        expect(authTokenPacket.name).to.equal('AuthTokenPacket');
        expect(authTokenPacket.size).to.equal(50);
    });

    it('should initialize properties correctly', function () {
        expect(authTokenPacket.username).to.equal('testuser');
        expect(authTokenPacket.key).to.equal(1234567890);
        expect(authTokenPacket.Xteakeys).to.deep.equal([1, 2, 3, 4]);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(50);
        buffer.write('testuser\0', 0, 'ascii');
        buffer.writeUInt32LE(1234567890, 31);
        buffer.writeUInt32LE(1, 35);
        buffer.writeUInt32LE(2, 39);
        buffer.writeUInt32LE(3, 43);
        buffer.writeUInt32LE(4, 47);

        const unpackedPacket = new AuthTokenPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.username).to.equal('testuser');
        expect(unpackedPacket.key).to.equal(1234567890);
        expect(unpackedPacket.Xteakeys).to.deep.equal([1, 2, 3, 4]);
    });
});
