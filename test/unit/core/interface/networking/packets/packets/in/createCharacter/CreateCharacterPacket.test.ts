import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import CreateCharacterPacket from '@/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacket';

describe('CreateCharacterPacket', function () {
    let createCharacterPacket: CreateCharacterPacket;

    beforeEach(function () {
        createCharacterPacket = new CreateCharacterPacket({
            slot: 1,
            playerName: 'testPlayer',
            playerClass: 123,
            appearance: 5,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(createCharacterPacket.getHeader()).to.equal(PacketHeaderEnum.CREATE_CHARACTER);
        expect(createCharacterPacket.getName()).to.equal('CreateCharacterPacket');
        expect(createCharacterPacket.getSize()).to.equal(29);
    });

    it('should initialize properties correctly', function () {
        expect(createCharacterPacket.getSlot()).to.equal(1);
        expect(createCharacterPacket.getPlayerName()).to.equal('testPlayer');
        expect(createCharacterPacket.getPlayerClass()).to.equal(123);
        expect(createCharacterPacket.getAppearance()).to.equal(5);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(31);
        buffer.writeUInt8(0, 0);
        buffer.writeUInt8(1, 1);
        buffer.write('testPlayer\0', 2, 'ascii');
        buffer.writeUInt16LE(123, 27);
        buffer.writeUInt8(5, 29);

        const unpackedPacket = new CreateCharacterPacket({
            appearance: 0,
            playerClass: 0,
            playerName: '',
            slot: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getSlot()).to.equal(1);
        expect(unpackedPacket.getPlayerName()).to.equal('testPlayer');
        expect(unpackedPacket.getPlayerClass()).to.equal(123);
        expect(unpackedPacket.getAppearance()).to.equal(5);
    });
});
