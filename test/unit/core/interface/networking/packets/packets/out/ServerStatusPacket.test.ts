import { expect } from 'chai';
import ServerStatusPacket from '@/core/interface/networking/packets/packet/out/ServerStatusPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

/**
 * The client's CServerStateChecker::Update reads header (1), an int it uses
 * as the CHANNEL COUNT (4), then count x TChannelStatus {short port; BYTE
 * status} (3 each); the original server appends one success byte after the
 * entries (input_db.cpp RespondChannelStatus). Total = 6 + 3 per channel.
 */
describe('ServerStatusPacket', () => {
    it('initializes with the SERVER_STATUS header', () => {
        const packet = new ServerStatusPacket();
        expect(packet.getHeader()).to.equal(PacketHeaderEnum.SERVER_STATUS);
        expect(packet.getName()).to.equal('ServerStatusPacket');
    });

    it('packs one channel into 9 bytes with the entry count in the count field', () => {
        const buffer = new ServerStatusPacket({
            status: [{ port: 13001, status: 1 }],
            isSuccess: true,
        }).pack();

        expect(buffer).to.have.lengthOf(9);
        expect(buffer.readUInt8(0), 'header').to.equal(PacketHeaderEnum.SERVER_STATUS);
        expect(buffer.readUInt32LE(1), 'channel count, not byte size').to.equal(1);
        expect(buffer.readUInt16LE(5), 'port').to.equal(13001);
        expect(buffer.readUInt8(7), 'status').to.equal(1);
        expect(buffer.readUInt8(8), 'success flag').to.equal(1);
    });

    it('packs two channels into 12 bytes so the client loop reads both and terminates', () => {
        const buffer = new ServerStatusPacket({
            status: [
                { port: 13001, status: 1 },
                { port: 13010, status: 0 },
            ],
            isSuccess: true,
        }).pack();

        expect(buffer).to.have.lengthOf(12);
        expect(buffer.readUInt32LE(1), 'channel count').to.equal(2);
        expect(buffer.readUInt16LE(5), 'first port').to.equal(13001);
        expect(buffer.readUInt8(7), 'first status').to.equal(1);
        expect(buffer.readUInt16LE(8), 'second port').to.equal(13010);
        expect(buffer.readUInt8(10), 'second status').to.equal(0);
        expect(buffer.readUInt8(11), 'success flag').to.equal(1);
    });
});
