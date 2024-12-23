export default class BufferWriter {
    private buffer: Buffer;
    private lastPos: number = 1;

    constructor(header: number, size: number) {
        this.buffer = Buffer.alloc(size);
        this.buffer[0] = header;
    }

    getBuffer(): Buffer {
        return this.buffer;
    }

    writeUint8(value: number): this {
        this.buffer.writeUInt8(value, this.lastPos);
        this.lastPos += 1;
        return this;
    }

    writeUint16LE(value: number): this {
        this.buffer.writeUInt16LE(value, this.lastPos);
        this.lastPos += 2;
        return this;
    }

    writeUint32LE(value: number): this {
        this.buffer.writeUInt32LE(value, this.lastPos);
        this.lastPos += 4;
        return this;
    }

    writeUint64LE(value: number | bigint): this {
        this.buffer.writeBigUInt64LE(BigInt(value), this.lastPos);
        this.lastPos += 8;
        return this;
    }

    writeString(value: string, length: number): this {
        const asciiBytes = Buffer.from(value, 'ascii').subarray(0, length - 1);
        asciiBytes.copy(this.buffer, this.lastPos);

        const fillStart = this.lastPos + asciiBytes.length;
        const fillEnd = this.lastPos + length - 1;
        this.buffer.fill(0, fillStart, fillEnd);

        this.buffer[fillEnd] = 0;
        this.lastPos += length;

        return this;
    }

    writeFloatLE(value: number): this {
        this.buffer.writeFloatLE(value, this.lastPos);
        this.lastPos += 4;
        return this;
    }
}
