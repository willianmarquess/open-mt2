import { expect } from 'chai';
import LoginRequestPacket from '../../../../../../../../src/core/interface/networking/packets/packet/in/LoginRequestPacket.js';
import PacketHeaderEnum from '../../../../../../../../src/core/enum/PacketHeaderEnum.js';

describe('LoginRequestPacket', function () {
    let loginRequestPacket;

    beforeEach(function () {
        loginRequestPacket = new LoginRequestPacket({
            username: 'testUser',
            password: 'testPass',
            key: 123456,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(loginRequestPacket.header).to.equal(PacketHeaderEnum.LOGIN_REQUEST);
        expect(loginRequestPacket.name).to.equal('LoginRequestPacket');
        expect(loginRequestPacket.size).to.equal(66);
    });

    it('should initialize properties correctly', function () {
        expect(loginRequestPacket.username).to.equal('testUser');
        expect(loginRequestPacket.password).to.equal('testPass');
        expect(loginRequestPacket.key).to.equal(123456);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(60);
        buffer.writeUint8(0, 0); // header
        buffer.write('testUser\0', 1, 'ascii'); // username
        buffer.write('testPass\0', 32, 'ascii'); // password
        buffer.writeUInt32LE(123456, 48); // key

        const unpackedPacket = new LoginRequestPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.username).to.equal('testUser');
        expect(unpackedPacket.password).to.equal('testPass');
        expect(unpackedPacket.key).to.equal(123456);
    });
});
