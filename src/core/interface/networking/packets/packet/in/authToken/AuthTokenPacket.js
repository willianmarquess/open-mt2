import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';
import AuthTokenPacketValidator from './AuthTokenPacketValidator.js';

export default class AuthTokenPacket extends PacketIn {
    #username;
    #key;
    #xteaKeys;

    constructor({ username, key, xteaKeys } = {}) {
        super({
            header: PacketHeaderEnum.TOKEN,
            name: 'AuthTokenPacket',
            size: 50,
            validator: AuthTokenPacketValidator,
        });
        this.#username = username;
        this.#key = key;
        this.#xteaKeys = xteaKeys;
    }

    get username() {
        return this.#username;
    }

    get key() {
        return this.#key;
    }

    get xteaKeys() {
        return this.#xteaKeys;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#username = this.bufferReader.readString(31);
        this.#key = this.bufferReader.readUInt32LE();
        this.#xteaKeys = [
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
            this.bufferReader.readUInt32LE(),
        ];
        this.validate();
        return this;
    }
}
