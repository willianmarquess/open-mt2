import { expect } from 'chai';
import ClientVersionPacket from '../../../../../../../../src/core/interface/networking/packets/packet/in/ClientVersionPacket.js';
import PacketHeaderEnum from '../../../../../../../../src/core/enum/PacketHeaderEnum.js';

describe('ClientVersionPacket', function () {
    let clientVersionPacket;

    beforeEach(function () {
        clientVersionPacket = new ClientVersionPacket({
            clientName: 'testClient',
            timeStamp: '2023-06-05 12:34:56',
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(clientVersionPacket.header).to.equal(PacketHeaderEnum.CLIENT_VERSION);
        expect(clientVersionPacket.name).to.equal('ClientVersionPacket');
        expect(clientVersionPacket.size).to.equal(67);
    });

    it('should initialize properties correctly', function () {
        expect(clientVersionPacket.clientName).to.equal('testClient');
        expect(clientVersionPacket.timeStamp).to.equal('2023-06-05 12:34:56');
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(68);
        buffer.writeInt8(0, 0); // header
        buffer.write('testClient\0', 1, 'ascii'); // clientName
        buffer.write('2023-06-05 12:34:56\0', 34, 'ascii'); // timeStamp

        const unpackedPacket = new ClientVersionPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.clientName).to.equal('testClient');
        expect(unpackedPacket.timeStamp).to.equal('2023-06-05 12:34:56');
    });
});
