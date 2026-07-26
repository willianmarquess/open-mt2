import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import CharacterInfoPacket from '@/core/interface/networking/packets/packet/out/CharacterInfoPacket';
import CharacterSpawnPacket from '@/core/interface/networking/packets/packet/out/CharacterSpawnPacket';
import { expect } from 'chai';

describe('BufferWriter', function () {
    let bufferWriter: BufferWriter;

    beforeEach(function () {
        bufferWriter = new BufferWriter(0x01, 20);
    });

    it('should initialize buffer with correct header', function () {
        const buffer = bufferWriter.getBuffer();
        expect(buffer[0]).to.equal(0x01);
    });

    it('should write an 8-bit unsigned integer', function () {
        bufferWriter.writeUint8(0x02);
        const buffer = bufferWriter.getBuffer();
        expect(buffer[1]).to.equal(0x02);
    });

    it('should write a 16-bit unsigned integer in little-endian format', function () {
        bufferWriter.writeUint16LE(0x0304);
        const buffer = bufferWriter.getBuffer();
        expect(buffer.readUInt16LE(1)).to.equal(0x0304);
    });

    it('should write a 32-bit unsigned integer in little-endian format', function () {
        bufferWriter.writeUint32LE(0x05060708);
        const buffer = bufferWriter.getBuffer();
        expect(buffer.readUInt32LE(1)).to.equal(0x05060708);
    });

    it('should write a 64-bit unsigned integer in little-endian format', function () {
        bufferWriter.writeUint64LE(BigInt('0x0102030405060708'));
        const buffer = bufferWriter.getBuffer();
        expect(buffer.readBigUInt64LE(1)).to.equal(BigInt('0x0102030405060708'));
    });

    it('should write a string of specified length', function () {
        bufferWriter.writeString('Hello', 10);
        const buffer = bufferWriter.getBuffer();
        expect(buffer.toString('ascii', 1, 6)).to.equal('Hello');
        expect(buffer[10]).to.equal(0);
    });

    it('should write a float in little-endian format', function () {
        bufferWriter.writeFloatLE(3.14);
        const buffer = bufferWriter.getBuffer();

        expect(buffer.readFloatLE(1)).to.be.closeTo(3.14, 0.00001);
    });

    it('should reset the cursor on getBuffer so the writer can be reused', function () {
        bufferWriter.writeUint8(0x02).writeUint32LE(1234);
        const first = Buffer.from(bufferWriter.getBuffer());

        bufferWriter.writeUint8(0x02).writeUint32LE(1234);
        const second = Buffer.from(bufferWriter.getBuffer());

        expect(second.equals(first)).to.be.equal(true);
    });

    describe('packet reuse (single-use packet regression)', function () {
        it('should allow packing the same fixed-size packet more than once', function () {
            const packet = new CharacterSpawnPacket({
                vid: 1,
                playerClass: 0,
                entityType: 6,
                attackSpeed: 100,
                movementSpeed: 100,
                positionX: 100,
                positionY: 200,
                positionZ: 0,
                rotation: 0,
                affects: [0, 0],
                state: 0,
            });

            const first = Buffer.from(packet.pack());
            const second = Buffer.from(packet.pack());

            expect(second.equals(first)).to.be.equal(true);
        });

        it('should allow packing a string-field packet more than once', function () {
            const packet = new CharacterInfoPacket({
                vid: 1,
                playerName: 'Rider',
                parts: [1, 2, 0, 3],
                empireId: 1,
                guildId: 0,
                level: 25,
                rankPoints: 0,
                pkMode: 0,
                mountId: 20101,
            });

            const first = Buffer.from(packet.pack());
            const second = Buffer.from(packet.pack());

            expect(second.equals(first)).to.be.equal(true);
        });
    });
});
