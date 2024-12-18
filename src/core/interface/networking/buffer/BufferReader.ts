export default class BufferReader {
    private lastPos: number = 0;
    private buffer: Buffer;

    setBuffer(buffer: Buffer, skipHeader: boolean = true) {
        this.buffer = buffer;
        this.lastPos = skipHeader ? 1 : 0;
    }

    readUInt32LE() {
        const value = this.buffer.readUint32LE(this.lastPos);
        this.lastPos += 4;
        return value;
    }

    readUInt16LE() {
        const value = this.buffer.readUint16LE(this.lastPos);
        this.lastPos += 2;
        return value;
    }

    readUInt8() {
        const value = this.buffer.readUInt8(this.lastPos);
        this.lastPos += 1;
        return value;
    }

    readString(size = 0) {
        size ||= this.buffer.byteLength - this.lastPos;
        const subBuffer = this.buffer.subarray(this.lastPos, this.lastPos + size);
        const nullIndex = subBuffer.indexOf(0);

        if (nullIndex === -1) {
            const result = subBuffer.toString('ascii');
            this.lastPos += size;
            return result;
        }

        const result = subBuffer.subarray(0, nullIndex).toString('ascii');
        this.lastPos += size;
        return result;
    }
}
