import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import AuthTokenPacket from '@/core/interface/networking/packets/packet/in/authToken/AuthTokenPacket';

describe('AuthTokenPacket', function () {
    let authTokenPacket: AuthTokenPacket;

    beforeEach(function () {
        authTokenPacket = new AuthTokenPacket({
            username: 'testuser',
            key: 1234567890,
            xteaKeys: [1, 2, 3, 4],
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(authTokenPacket.getHeader()).to.equal(PacketHeaderEnum.TOKEN);
        expect(authTokenPacket.getName()).to.equal('AuthTokenPacket');
        expect(authTokenPacket.getSize()).to.equal(52);
    });

    it('should initialize properties correctly', function () {
        expect(authTokenPacket.getUsername()).to.equal('testuser');
        expect(authTokenPacket.getKey()).to.equal(1234567890);
        expect(authTokenPacket.getXteaKeys()).to.deep.equal([1, 2, 3, 4]);
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

        const unpackedPacket = new AuthTokenPacket({
            key: 0,
            username: '',
            xteaKeys: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getUsername()).to.equal('testuser');
        expect(unpackedPacket.getKey()).to.equal(1234567890);
        expect(unpackedPacket.getXteaKeys()).to.deep.equal([1, 2, 3, 4]);
    });
});
