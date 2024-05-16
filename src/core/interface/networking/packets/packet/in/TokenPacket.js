import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class TokenPacket extends PacketIn {
    #username;
    #key;
    #Xteakeys;

    constructor({ username, key, Xteakeys } = {}) {
        super({
            header: PacketHeaderEnum.TOKEN,
            name: 'TokenPacket',
            size: 50,
        });
        this.#username = username;
        this.#key = key;
        this.#Xteakeys = Xteakeys;
    }

    get username() {
        return this.#username;
    }

    get key() {
        return this.#key;
    }

    get Xteakeys() {
        return this.#Xteakeys;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#username = this.bufferReader.readString(31);
        this.#key = this.bufferReader.readUInt32LE();
        this.#Xteakeys = [
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
        ];
        return this;
    }
}
