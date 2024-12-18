import { expect } from 'chai';
import BufferReader from '../../../../../../src/core/interface/networking/buffer/BufferReader';

describe('BufferReader', function () {
    let bufferReader;

    beforeEach(function () {
        bufferReader = new BufferReader();
    });

    it('should set buffer and skip header if skippHeader is true', function () {
        const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
        bufferReader.setBuffer(buffer, true);

        const result = bufferReader.readUInt8();
        expect(result).to.equal(0x01);
    });

    it('should set buffer and not skip header if skippHeader is false', function () {
        const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readUInt8();
        expect(result).to.equal(0x00);
    });

    it('should read a 32-bit unsigned integer in little-endian format', function () {
        const buffer = Buffer.from([0x04, 0x03, 0x02, 0x01, 0x00]);
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readUInt32LE();
        expect(result).to.equal(0x01020304);
    });

    it('should read a 16-bit unsigned integer in little-endian format', function () {
        const buffer = Buffer.from([0x02, 0x01, 0x00, 0x00]);
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readUInt16LE();
        expect(result).to.equal(0x0102);
    });

    it('should read an 8-bit unsigned integer', function () {
        const buffer = Buffer.from([0x01, 0x02, 0x03]);
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readUInt8();
        expect(result).to.equal(0x01);
    });

    it('should read a string of specified size', function () {
        const buffer = Buffer.from('Hello, world!\0', 'ascii');
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readString(5);
        expect(result).to.equal('Hello');
    });

    it('should read a null-terminated string if size is not specified', function () {
        const buffer = Buffer.from('Hello, world!\0', 'ascii');
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readString();
        expect(result).to.equal('Hello, world!');
    });

    it('should read a string until the null character if size is larger than the string length', function () {
        const buffer = Buffer.from('Hello\0world', 'ascii');
        bufferReader.setBuffer(buffer, false);

        const result = bufferReader.readString(10);
        expect(result).to.equal('Hello');
    });
});
