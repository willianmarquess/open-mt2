import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketOut from './PacketOut.js';

export default class TeleportPacket extends PacketOut {
    #positionX;
    #positionY;
    #address;
    #port;

    constructor({ positionX, positionY, address, port } = {}) {
        super({
            header: PacketHeaderEnum.TELEPORT,
            name: 'TeleportPacket',
            size: 15,
        });
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#address = address;
        this.#port = port;
    }

    pack() {
        this.bufferWriter.writeUint32LE(this.#positionX);
        this.bufferWriter.writeUint32LE(this.#positionY);
        this.bufferWriter.writeUint32LE(this.#address);
        this.bufferWriter.writeUint16LE(this.#port);
        return this.bufferWriter.buffer;
    }
}
