export default class BufferReader {
    #lastPos = 0;
    #buffer;

    setBuffer(buffer, skippHeader = true) {
        this.#buffer = buffer;
        this.#lastPos = skippHeader ? 1 : 0;
    }

    readUInt32LE() {
        const value = this.#buffer.readUint32LE(this.#lastPos);
        this.#lastPos += 4;
        return value;
    }

    readUInt16LE() {
        const value = this.#buffer.readUint16LE(this.#lastPos);
        this.#lastPos += 2;
        return value;
    }

    readUInt8() {
        const value = this.#buffer.readInt8(this.#lastPos);
        this.#lastPos += 1;
        return value;
    }

    readString(size = 0) {
        size ||= this.#buffer.byteLength;
        const value = this.#buffer
            .subarray(this.#lastPos, this.#lastPos + size)
            .toString()
            .replace(/\x00/g, '');
        this.#lastPos += size;
        return value;
    }
}
