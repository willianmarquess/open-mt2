import { expect } from 'chai';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import CharacterMovePacket from '@/core/interface/networking/packets/packet/in/characterMove/CharacterMovePacket';

describe('CharacterMovePacket', function () {
    let characterMovePacket: CharacterMovePacket;

    beforeEach(function () {
        characterMovePacket = new CharacterMovePacket({
            movementType: 1,
            arg: 2,
            rotation: 3,
            positionX: 12345,
            positionY: 67890,
            time: 54321,
        });
    });

    it('should initialize with correct header, name, and size', function () {
        expect(characterMovePacket.getHeader()).to.equal(PacketHeaderEnum.CHARACTER_MOVE);
        expect(characterMovePacket.getName()).to.equal('CharacterMovePacket');
        expect(characterMovePacket.getSize()).to.equal(17);
    });

    it('should initialize properties correctly', function () {
        expect(characterMovePacket.getMovementType()).to.equal(1);
        expect(characterMovePacket.getArg()).to.equal(2);
        expect(characterMovePacket.getRotation()).to.equal(3);
        expect(characterMovePacket.getPositionX()).to.equal(12345);
        expect(characterMovePacket.getPositionY()).to.equal(67890);
        expect(characterMovePacket.getTime()).to.equal(54321);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(17);
        buffer.writeUInt8(0, 0);
        buffer.writeUInt8(1, 1);
        buffer.writeUInt8(2, 2);
        buffer.writeUInt8(3, 3);
        buffer.writeUInt32LE(12345, 4);
        buffer.writeUInt32LE(67890, 8);
        buffer.writeUInt32LE(54321, 12);

        const unpackedPacket = new CharacterMovePacket({
            arg: 0,
            movementType: 0,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            time: 0,
        });
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.getMovementType()).to.equal(1);
        expect(unpackedPacket.getArg()).to.equal(2);
        expect(unpackedPacket.getRotation()).to.equal(3);
        expect(unpackedPacket.getPositionX()).to.equal(12345);
        expect(unpackedPacket.getPositionY()).to.equal(67890);
        expect(unpackedPacket.getTime()).to.equal(54321);
    });
});
