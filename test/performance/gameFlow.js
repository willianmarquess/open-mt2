import assert from 'node:assert';
import SocketClient from '../support/SocketClient.js';
import ConnectionStateEnum from '../../src/core/enum/ConnectionStateEnum.js';
import BufferReader from '../../src/core/interface/networking/buffer/BufferReader.js';
import BufferWriter from '../../src/core/interface/networking/buffer/BufferWriter.js';
import PacketHeaderEnum from '../../src/core/enum/PacketHeaderEnum.js';
import EmpirePacket from '../../src/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket.js';
import MathUtil from '../../src/core/domain/util/MathUtil.js';
import MovementTypeEnum from '../../src/core/enum/MovementTypeEnum.js';

const port = process.env.GAME_SERVER_PORT;
const host = process.env.GAME_SERVER_ADDRESS;

const connectToClient = async (host, port) => {
    const client = new SocketClient();
    await client.connect(host, port);
    return client;
};

const receiveAndValidateState = async (client, expectedState) => {
    const statePacket = await client.nextMessage(2);
    const { state } = unpackStatePacket(statePacket);
    assert.deepStrictEqual(state, expectedState);
};

const unpackStatePacket = (buffer) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);
    const state = bufferReader.readUInt8();
    return {
        state,
    };
};

const unpackHandshakePacket = (buffer) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);
    const id = bufferReader.readUInt32LE();
    const time = bufferReader.readUInt32LE();
    const delta = bufferReader.readUInt32LE();
    return {
        id,
        time,
        delta,
    };
};

const createHandshakePacket = (id, time, delta) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.HANDSHAKE, 13);
    bufferWriter.writeUint32LE(id).writeUint32LE(time).writeUint32LE(delta);
    return bufferWriter.buffer;
};

const unpackCharactersInfoPacket = (buffer) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);

    const id = bufferReader.readUInt32LE();
    const name = bufferReader.readString(25);
    const clazz = bufferReader.readUInt8();
    const level = bufferReader.readUInt8();
    const playTime = bufferReader.readUInt32LE();
    const str = bufferReader.readUInt8();
    const vit = bufferReader.readUInt8();
    const dx = bufferReader.readUInt8();
    const int = bufferReader.readUInt8();
    const bodyPart = bufferReader.readUInt16LE();
    const nameChanged = bufferReader.readUInt8();
    const hairPart = bufferReader.readUInt16LE();
    bufferReader.readUInt32LE();
    const positionX = bufferReader.readUInt32LE();
    const positionY = bufferReader.readUInt32LE();
    const ip = bufferReader.readUInt32LE();
    const port = bufferReader.readUInt16LE();
    const skillGroup = bufferReader.readUInt8();

    return {
        id,
        name,
        clazz,
        level,
        playTime,
        str,
        vit,
        dx,
        int,
        bodyPart,
        nameChanged,
        hairPart,
        positionX,
        positionY,
        ip,
        port,
        skillGroup,
    };
};

const createAuthPacket = (user, token) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.TOKEN, 52);
    bufferWriter.writeString(user, 31);
    bufferWriter.writeUint32LE(token);
    bufferWriter.writeUint32LE(0);
    bufferWriter.writeUint32LE(0);
    bufferWriter.writeUint32LE(0);
    bufferWriter.writeUint32LE(0);
    return bufferWriter.buffer;
};

const unpackEmpirePacket = (buffer) => {
    return new EmpirePacket().unpack(buffer);
};

const createSelectCharacterPacket = () => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.SELECT_CHARACTER, 2);
    bufferWriter.writeUint8(0);
    return bufferWriter.buffer;
};

const unpackCharacterDetailPacket = (buffer) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);

    const vid = bufferReader.readUInt32LE();
    const clazz = bufferReader.readUInt16LE();
    const name = bufferReader.readString(25);
    const positionX = bufferReader.readUInt32LE();
    const positionY = bufferReader.readUInt32LE();
    const positionZ = bufferReader.readUInt32LE();
    const empireId = bufferReader.readUInt8();
    const skillGroup = bufferReader.readUInt8();

    return {
        vid,
        clazz,
        name,
        positionX,
        positionY,
        positionZ,
        empireId,
        skillGroup,
    };
};

const createEnterGamePacket = () => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.ENTER_GAME, 1);
    return bufferWriter.buffer;
};

const createCharacterMovePacket = (rotation, positionX, positionY) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.CHARACTER_MOVE, 17);
    bufferWriter.writeUint8(MovementTypeEnum.MOVE);
    bufferWriter.writeUint8(0);
    bufferWriter.writeUint8(rotation);
    bufferWriter.writeUint32LE(positionX);
    bufferWriter.writeUint32LE(positionY);
    bufferWriter.writeUint32LE(performance.now());
    return bufferWriter.buffer;
};

export default class GameFlow {
    #user;
    #token;
    #client;
    #player;

    constructor(user, token) {
        this.#user = user;
        this.#token = token;
    }

    async connect() {
        this.#client = await connectToClient(host, port);
    }

    async basicFlow() {
        await receiveAndValidateState(this.#client, ConnectionStateEnum.HANDSHAKE);

        const handshakeRequestPacket = await this.#client.nextMessage(13);
        const { id, time, delta } = unpackHandshakePacket(handshakeRequestPacket);

        assert.ok(id);
        assert.ok(time);
        assert.deepStrictEqual(delta, 0);

        const handshakeResponsePacket = createHandshakePacket(id, time, delta);
        this.#client.sendMessage(handshakeResponsePacket);

        await receiveAndValidateState(this.#client, ConnectionStateEnum.LOGIN);

        const authPacket = createAuthPacket(this.#user, this.#token);
        this.#client.sendMessage(authPacket);

        const empirePacket = await this.#client.nextMessage(3);
        const { empireId } = unpackEmpirePacket(empirePacket);

        assert.deepStrictEqual(empireId, 2);

        const playerListPacket = await this.#client.nextMessage(331);
        this.#player = unpackCharactersInfoPacket(playerListPacket);

        const selectCharacterPacket = createSelectCharacterPacket();
        this.#client.sendMessage(selectCharacterPacket);

        await receiveAndValidateState(this.#client, ConnectionStateEnum.LOADING);

        const characterDetailPacket = await this.#client.nextMessage(46);
        this.#player = {
            ...this.#player,
            ...unpackCharacterDetailPacket(characterDetailPacket),
        };

        const enterGamePacket = createEnterGamePacket();
        this.#client.sendMessage(enterGamePacket);
    }

    async moveToRandomLocation() {
        const x = Math.max(0, Math.min(MathUtil.MAX_UINT, this.#player.positionX + MathUtil.getRandomInt(-1000, 1000)));
        const y = Math.max(0, Math.min(MathUtil.MAX_UINT, this.#player.positionY + MathUtil.getRandomInt(-1000, 1000)));

        const rotation = MathUtil.calcRotation(x - this.#player.positionX, y - this.#player.positionY) / 5;
        const movePacket = createCharacterMovePacket(rotation, x, y);
        this.#client.sendMessage(movePacket);
    }

    async close() {
        return this.#client.close();
    }
}
