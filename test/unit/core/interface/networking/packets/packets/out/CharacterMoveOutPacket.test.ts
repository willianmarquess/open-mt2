import { expect } from 'chai';
import CharacterMoveOutPacket from '@/core/interface/networking/packets/packet/out/CharacterMoveOutPacket';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

/**
 * The wire layout is TPacketGCMove (client Packet.h, #pragma pack(1)):
 * header 1 + bFunc 1 + bArg 1 + bRot 1 + dwVID 4 + lX 4 + lY 4 + dwTime 4 +
 * dwDuration 4 = 24 bytes. The client's RecvCharacterMovePacket consumes
 * exactly sizeof(TPacketGCMove); the offsets below are that struct's offsets.
 */
describe('CharacterMoveOutPacket', () => {
    const packet = () =>
        new CharacterMoveOutPacket({
            vid: 123456,
            movementType: 5,
            arg: 7,
            rotation: 9,
            positionX: 358400,
            positionY: 153600,
            time: 987654,
            duration: 300,
        });

    it('initializes with the CHARACTER_MOVE_OUT header', () => {
        expect(packet().getHeader()).to.equal(PacketHeaderEnum.CHARACTER_MOVE_OUT);
        expect(packet().getName()).to.equal('CharacterMoveOutPacket');
    });

    it('packs to the client struct size of 24 bytes', () => {
        expect(packet().pack()).to.have.lengthOf(24);
    });

    it('packs every field at the client struct offsets', () => {
        const buffer = packet().pack();

        expect(buffer.readUInt8(0), 'header').to.equal(PacketHeaderEnum.CHARACTER_MOVE_OUT);
        expect(buffer.readUInt8(1), 'movementType').to.equal(5);
        expect(buffer.readUInt8(2), 'arg').to.equal(7);
        expect(buffer.readUInt8(3), 'rotation').to.equal(9);
        expect(buffer.readUInt32LE(4), 'vid').to.equal(123456);
        expect(buffer.readUInt32LE(8), 'positionX').to.equal(358400);
        expect(buffer.readUInt32LE(12), 'positionY').to.equal(153600);
        expect(buffer.readUInt32LE(16), 'time').to.equal(987654);
        expect(buffer.readUInt32LE(20), 'duration').to.equal(300);
    });

    it('ends exactly at the duration field, with no trailing padding byte', () => {
        const buffer = packet().pack();

        expect(buffer.readUInt32LE(buffer.length - 4), 'last 4 bytes are the duration').to.equal(300);
    });
});
