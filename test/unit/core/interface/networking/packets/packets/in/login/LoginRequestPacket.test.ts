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
        expect(loginRequestPacket.getSize()).to.equal(65);
    });

    it('should initialize properties correctly', function () {
        expect(loginRequestPacket.getUsername()).to.equal('testUser');
        expect(loginRequestPacket.getPassword()).to.equal('testPass');
        expect(loginRequestPacket.getKey()).to.equal(123456);
    });

    // The wire layout is the client's TPacketCGLogin3 (#pragma pack(1)):
    // header@0, login[31]@1, passwd[17]@32, adwClientKey[4]@49 = 65 bytes.
    const clientFrame = ({ username, password, key }: { username: string; password: string; key: number }) => {
        const buffer = Buffer.alloc(65);
        buffer.writeUint8(PacketHeaderEnum.LOGIN_REQUEST, 0);
        buffer.write(username, 1, 'ascii');
        buffer.write(password, 32, 'ascii');
        buffer.writeUInt32LE(key, 49);
        buffer.writeUInt32LE(0xdeadbeef, 53);
        buffer.writeUInt32LE(0xcafebabe, 57);
        buffer.writeUInt32LE(0x12345678, 61);
        return buffer;
    };

    const unpacked = (frame: Buffer) => new LoginRequestPacket({ key: 0, password: '', username: '' }).unpack(frame);

    it('should unpack the fields at the client struct offsets', function () {
        const packet = unpacked(clientFrame({ username: 'testUser', password: 'testPass', key: 123456 }));

        expect(packet.getUsername()).to.equal('testUser');
        expect(packet.getPassword()).to.equal('testPass');
        expect(packet.getKey()).to.equal(123456);
    });

    it('should read the client key from adwClientKey[0], not one byte early', function () {
        const packet = unpacked(clientFrame({ username: 'user', password: 'pass', key: 0x11223344 }));

        expect(packet.getKey()).to.equal(0x11223344);
    });

    it('should read a maximum-length 16 character password intact', function () {
        const packet = unpacked(clientFrame({ username: 'user', password: 'abcdefghijklmnop', key: 7 }));

        expect(packet.getPassword()).to.equal('abcdefghijklmnop');
        expect(packet.getKey()).to.equal(7);
    });
});
