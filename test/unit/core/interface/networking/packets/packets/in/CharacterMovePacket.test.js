import { expect } from 'chai';
import CharacterMovePacket from '../../../../../../../../src/core/interface/networking/packets/packet/in/CharacterMovePacket.js';
import PacketHeaderEnum from '../../../../../../../../src/core/enum/PacketHeaderEnum.js';

describe('CharacterMovePacket', function () {
    let characterMovePacket;

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
        expect(characterMovePacket.header).to.equal(PacketHeaderEnum.CHARACTER_MOVE);
        expect(characterMovePacket.name).to.equal('CharacterMovePacket');
        expect(characterMovePacket.size).to.equal(17);
    });

    it('should initialize properties correctly', function () {
        expect(characterMovePacket.movementType).to.equal(1);
        expect(characterMovePacket.arg).to.equal(2);
        expect(characterMovePacket.rotation).to.equal(3);
        expect(characterMovePacket.positionX).to.equal(12345);
        expect(characterMovePacket.positionY).to.equal(67890);
        expect(characterMovePacket.time).to.equal(54321);
    });

    it('should unpack data correctly', function () {
        const buffer = Buffer.alloc(17);
        buffer.writeUInt8(1, 0); // movementType
        buffer.writeUInt8(2, 1); // arg
        buffer.writeUInt8(3, 2); // rotation
        buffer.writeUInt32LE(12345, 3); // positionX
        buffer.writeUInt32LE(67890, 7); // positionY
        buffer.writeUInt32LE(54321, 11); // time

        const unpackedPacket = new CharacterMovePacket();
        unpackedPacket.unpack(buffer);

        expect(unpackedPacket.movementType).to.equal(1);
        expect(unpackedPacket.arg).to.equal(2);
        expect(unpackedPacket.rotation).to.equal(3);
        expect(unpackedPacket.positionX).to.equal(12345);
        expect(unpackedPacket.positionY).to.equal(67890);
        expect(unpackedPacket.time).to.equal(54321);
    });
});
