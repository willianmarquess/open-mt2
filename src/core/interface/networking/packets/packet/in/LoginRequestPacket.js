import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class LoginRequestPacket extends PacketIn {
    #username;
    #password;
    #key;

    constructor({ username, password, key } = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_REQUEST,
            name: 'LoginRequestPacket',
            size: 66,
        });
        this.#username = username;
        this.#password = password;
        this.#key = key;
    }

    get username() {
        return this.#username;
    }

    get password() {
        return this.#password;
    }

    get key() {
        return this.#key;
    }

    unpack(buffer) {
        this.bufferReader.setBuffer(buffer);
        this.#username = this.bufferReader.readString(31);
        this.#password = this.bufferReader.readString(16);
        this.#key = this.bufferReader.readUInt32LE();
        return this;
    }
}
