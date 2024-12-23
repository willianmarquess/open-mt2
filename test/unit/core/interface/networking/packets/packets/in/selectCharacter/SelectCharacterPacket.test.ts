import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import SelectCharacterPacket from '@/core/interface/networking/packets/packet/in/selectCharacter/SelectCharacterPacket';
import { expect } from 'chai';

describe('SelectCharacterPacket', function () {
    let selectCharacterPacket: SelectCharacterPacket;

    beforeEach(function () {
        selectCharacterPacket = new SelectCharacterPacket({ slot: 5 });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(selectCharacterPacket.getHeader()).to.equal(PacketHeaderEnum.SELECT_CHARACTER);
        expect(selectCharacterPacket.getName()).to.equal('SelectCharacterPacket');
        expect(selectCharacterPacket.getSize()).to.equal(2);
    });

    it('should initialize properties correctly', function () {
        expect(selectCharacterPacket.getSlot()).to.equal(5);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt8(5, 1);

        const unpackedPacket = new SelectCharacterPacket({
            slot: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getSlot()).to.equal(5);
    });
});
