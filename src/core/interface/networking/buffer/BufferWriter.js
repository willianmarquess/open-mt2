export default class BufferWriter {
    #buffer;

    #lastPos = 1;

    constructor(header, size) {
        this.#buffer = Buffer.alloc(size);
        this.#buffer[0] = header;
    }

    get buffer() {
        return this.#buffer;
    }

    writeUint8(value) {
        this.#buffer.writeUint8(value, this.#lastPos);
        this.#lastPos += 1;
        return this;
    }

    writeUint16LE(value) {
        this.#buffer.writeUint16LE(value, this.#lastPos);
        this.#lastPos += 2;
        return this;
    }

    writeUint32LE(value) {
        this.#buffer.writeUint32LE(value, this.#lastPos);
        this.#lastPos += 4;
        return this;
    }

    writeUint64LE(value) {
        this.#buffer.writeBigUInt64LE(value, this.#lastPos);
        this.#lastPos += 8;
        return this;
    }

    writeString(value, length) {
        const asciiBytes = Buffer.from(value, 'ascii').subarray(0, length - 1);
        asciiBytes.copy(this.#buffer, this.#lastPos);

        const fillStart = this.#lastPos + asciiBytes.length;
        const fillEnd = this.#lastPos + length - 1;
        this.#buffer.fill(0, fillStart, fillEnd);

        this.#buffer[fillEnd] = 0;

        this.#lastPos += length;

        return this;
    }
}
