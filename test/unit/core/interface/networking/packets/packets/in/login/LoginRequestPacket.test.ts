import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import LoginRequestPacket from '@/core/interface/networking/packets/packet/in/loginRequest/LoginRequestPacket';

describe('LoginRequestPacket', function () {
    let loginRequestPacket: LoginRequestPacket;

    beforeEach(function () {
        loginRequestPacket = new LoginRequestPacket({
            username: 'testUser',
            password: 'testPass',
            key: 123456,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(loginRequestPacket.getHeader()).to.equal(PacketHeaderEnum.LOGIN_REQUEST);
        expect(loginRequestPacket.getName()).to.equal('LoginRequestPacket');
        expect(loginRequestPacket.getSize()).to.equal(66);
    });

    it('should initialize properties correctly', function () {
        expect(loginRequestPacket.getUsername()).to.equal('testUser');
        expect(loginRequestPacket.getPassword()).to.equal('testPass');
        expect(loginRequestPacket.getKey()).to.equal(123456);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(60);
        buffer.writeUint8(0, 0);
        buffer.write('testUser\0', 1, 'ascii');
        buffer.write('testPass\0', 32, 'ascii');
        buffer.writeUInt32LE(123456, 48);

        const unpackedPacket = new LoginRequestPacket({
            key: 0,
            password: '',
            username: '',
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getUsername()).to.equal('testUser');
        expect(unpackedPacket.getPassword()).to.equal('testPass');
        expect(unpackedPacket.getKey()).to.equal(123456);
    });
});
