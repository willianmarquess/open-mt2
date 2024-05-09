export default class BufferUtil {
    static numberToByte(value) {
        return value & 0xff;
    }

    static bufferToNumber(value, offSet = 0, sizeInBytes = 4) {
        return value.subarray(offSet, offSet + sizeInBytes).readUInt32LE();
    }

    static bufferToString(value, start, end) {
        return value.subarray(start, end).toString().replace(/\x00/g, '');
    }

    static numberToBuffer(value, sizeInBytes = 4) {
        const buffer = Buffer.alloc(sizeInBytes);
        for (let i = 0; i < sizeInBytes; i++) {
            buffer[i] = this.numberToByte(value >> (i * 8));
        }
        return buffer;
    }
}
