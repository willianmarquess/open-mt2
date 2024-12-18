import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../../../../src/core/enum/PacketHeaderEnum';
import EmpirePacket from '../../../../../../../../../src/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';

describe('EmpirePacket', function () {
    let empirePacket;

    beforeEach(function () {
        empirePacket = new EmpirePacket({ empireId: 1 });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(empirePacket.header).to.equal(PacketHeaderEnum.EMPIRE);
        expect(empirePacket.name).to.equal('EmpirePacket');
        expect(empirePacket.size).to.equal(3);
    });

    it('should initialize empireId correctly', function () {
        expect(empirePacket.empireId).to.equal(1);
    });

    it('should pack data correctly', function () {
        const packedBuffer = empirePacket.pack();
        expect(packedBuffer[1]).to.equal(1);
        expect(packedBuffer[2]).to.equal(0);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.from([PacketHeaderEnum.EMPIRE, 1, 0]);
        const unpackedPacket = new EmpirePacket();
        unpackedPacket.unpack(buffer);
        expect(unpackedPacket.empireId).to.equal(1);
    });
});
