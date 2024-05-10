import PacketHeaderEnum from '../../../../enum/PacketHeaderEnum.js';
import BufferReader from '../../../buffer/BufferReader.js';
import PacketIn from './PacketIn.js';

export default class LoginRequestPacket extends PacketIn {
    #username;
    #password;
    #key;

    constructor({ username, password, key } = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_REQUEST,
            name: 'LoginRequestPacket',
            size: 13,
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

    static unpack(buffer) {
        const bufferReader = new BufferReader();
        bufferReader.setBuffer(buffer);
        const username = bufferReader.readString(31);
        const password = bufferReader.readString(16);
        const key = bufferReader.readUInt32LE();

        return new LoginRequestPacket({
            username,
            password,
            key,
        });
    }
}
