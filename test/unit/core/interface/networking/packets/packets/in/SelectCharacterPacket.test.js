import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../../../src/core/enum/PacketHeaderEnum.js';
import SelectCharacterPacket from '../../../../../../../../src/core/interface/networking/packets/packet/in/selectCharacter/SelectCharacterPacket.js';

describe('SelectCharacterPacket', function () {
    let selectCharacterPacket;

    beforeEach(function () {
        selectCharacterPacket = new SelectCharacterPacket({ slot: 5 });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(selectCharacterPacket.header).to.equal(PacketHeaderEnum.SELECT_CHARACTER);
        expect(selectCharacterPacket.name).to.equal('SelectCharacterPacket');
        expect(selectCharacterPacket.size).to.equal(2);
    });

    it('should initialize properties correctly', function () {
        expect(selectCharacterPacket.slot).to.equal(5);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt8(5, 1); // slot

        const unpackedPacket = new SelectCharacterPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.slot).to.equal(5);
    });
});
