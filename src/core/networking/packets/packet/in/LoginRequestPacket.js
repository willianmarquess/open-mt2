import PacketHeaderEnum from '../../../../enum/PacketHeaderEnum.js';
import BufferUtil from '../../../../util/BufferUtil.js';
import PacketIn from './PacketIn.js';

export default class LoginRequestPacket extends PacketIn {
    #username;
    #password;
    #key;

    constructor({ username, password, key } = {}) {
        super({
            header: PacketHeaderEnum.LOGIN_REQUEST,
            name: 'LoginRequestPacket',
            length: 13,
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

    pack() {}

    static unpack(buffer) {
        const username = BufferUtil.bufferToString(buffer, 1, 32);
        const password = BufferUtil.bufferToString(buffer, 32, 49);
        const key = BufferUtil.bufferToNumber(buffer, 49);
        return new LoginRequestPacket({
            username,
            password,
            key,
        });
    }
}
