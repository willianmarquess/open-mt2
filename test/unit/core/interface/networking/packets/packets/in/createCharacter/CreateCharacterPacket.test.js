import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../../../../src/core/enum/PacketHeaderEnum';
import CreateCharacterPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacket';

describe('CreateCharacterPacket', function () {
    let createCharacterPacket;

    beforeEach(function () {
        createCharacterPacket = new CreateCharacterPacket({
            slot: 1,
            playerName: 'testPlayer',
            playerClass: 123,
            appearance: 5,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(createCharacterPacket.header).to.equal(PacketHeaderEnum.CREATE_CHARACTER);
        expect(createCharacterPacket.name).to.equal('CreateCharacterPacket');
        expect(createCharacterPacket.size).to.equal(29);
    });

    it('should initialize properties correctly', function () {
        expect(createCharacterPacket.slot).to.equal(1);
        expect(createCharacterPacket.playerName).to.equal('testPlayer');
        expect(createCharacterPacket.playerClass).to.equal(123);
        expect(createCharacterPacket.appearance).to.equal(5);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(31);
        buffer.writeUInt8(0, 0); // header
        buffer.writeUInt8(1, 1); // slot
        buffer.write('testPlayer\0', 2, 'ascii'); // playerName
        buffer.writeUInt16LE(123, 27); // playerClass
        buffer.writeUInt8(5, 29); // appearance

        const unpackedPacket = new CreateCharacterPacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.slot).to.equal(1);
        expect(unpackedPacket.playerName).to.equal('testPlayer');
        expect(unpackedPacket.playerClass).to.equal(123);
        expect(unpackedPacket.appearance).to.equal(5);
    });
});
