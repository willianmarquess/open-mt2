import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import EmpirePacket from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';
import { expect } from 'chai';

describe('EmpirePacket', function () {
    let empirePacket: EmpirePacket;

    beforeEach(function () {
        empirePacket = new EmpirePacket({ empireId: 1 });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(empirePacket.getHeader()).to.equal(PacketHeaderEnum.EMPIRE);
        expect(empirePacket.getName()).to.equal('EmpirePacket');
        expect(empirePacket.getSize()).to.equal(2);
    });

    it('should initialize empireId correctly', function () {
        expect(empirePacket.getEmpireId()).to.equal(1);
    });

    it('should pack to the client TPacketGCEmpire size of 2 bytes', function () {
        const packedBuffer = empirePacket.pack();
        expect(packedBuffer).to.have.lengthOf(2);
        expect(packedBuffer[0]).to.equal(PacketHeaderEnum.EMPIRE);
        expect(packedBuffer[1]).to.equal(1);
    });

    it('should unpack a client frame (header + empire + sequence) correctly', function () {
        const buffer = Buffer.from([PacketHeaderEnum.EMPIRE, 1, 0]);
        const unpackedPacket = new EmpirePacket({
            empireId: 1,
        });
        unpackedPacket.unpack(buffer);
        expect(unpackedPacket.getEmpireId()).to.equal(1);
    });

    it('keeps the inbound frame length at header + empire + sequence, independent of the outbound size', function () {
        expect(empirePacket.getFrameLength()).to.equal(3);
    });
});
