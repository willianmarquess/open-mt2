import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import ClientVersionPacket from '@/core/interface/networking/packets/packet/in/clientVersion/ClientVersionPacket';
import { expect } from 'chai';

describe('ClientVersionPacket', function () {
    let clientVersionPacket: ClientVersionPacket;

    beforeEach(function () {
        clientVersionPacket = new ClientVersionPacket({
            clientName: 'testClient',
            timeStamp: '2023-06-05 12:34:56',
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(clientVersionPacket.getHeader()).to.equal(PacketHeaderEnum.CLIENT_VERSION);
        expect(clientVersionPacket.getName()).to.equal('ClientVersionPacket');
        expect(clientVersionPacket.getSize()).to.equal(67);
    });

    it('should initialize properties correctly', function () {
        expect(clientVersionPacket.getClientName()).to.equal('testClient');
        expect(clientVersionPacket.getTimeStamp()).to.equal('2023-06-05 12:34:56');
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(68);
        buffer.writeInt8(0, 0);
        buffer.write('testClient\0', 1, 'ascii');
        buffer.write('2023-06-05 12:34:56\0', 34, 'ascii');

        const unpackedPacket = new ClientVersionPacket({
            clientName: '',
            timeStamp: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getClientName()).to.equal('testClient');
        expect(unpackedPacket.getTimeStamp()).to.equal('2023-06-05 12:34:56');
    });
});
