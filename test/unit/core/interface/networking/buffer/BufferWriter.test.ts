import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
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
});
