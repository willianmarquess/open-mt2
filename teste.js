class BufferWriter {
    #buffer;

    #lastPos = 0;

    constructor(size) {
        this.#buffer = Buffer.alloc(size);
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

    writeString(value) {
        this.#buffer.write(value, this.#lastPos);
        this.#lastPos += Buffer.byteLength(value);
        return this;
    }
}

const bufWriter = new BufferWriter(20);

bufWriter.writeUint32LE(1000);
bufWriter.writeUint32LE(1000);
bufWriter.writeUint32LE(1000);
bufWriter.writeString("willian marques")

console.log(bufWriter.buffer);

class BufferReader {

    #lastPos = 0;
    #buffer;

    setBuffer(buffer) {
        this.#buffer = buffer;
    }

    readUInt32LE() {
        const value = this.#buffer.readUint32LE(this.#lastPos);
        this.#lastPos += 4;
        return value;
    }

    readString(size = 0) {
        size |= this.#buffer.byteLength;
        const value = this.#buffer.subarray(this.#lastPos, this.#lastPos + size).toString().replace(/\x00/g, '');
        this.#lastPos += size;
        return value;
    }
}

const bufReader = new BufferReader();
bufReader.setBuffer(bufWriter.buffer)
console.log(bufReader.readUInt32LE());
console.log(bufReader.readUInt32LE());
console.log(bufReader.readUInt32LE());
console.log(bufReader.readString());