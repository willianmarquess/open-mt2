import assert from 'node:assert';
import SocketClient from '../support/SocketClient';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

const createLoginPacket = (user, password, key) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.LOGIN_REQUEST, 66);
    bufferWriter.writeString(user, 31);
    bufferWriter.writeString(password, 16);
    bufferWriter.writeUint32LE(key);
    return bufferWriter.getBuffer();
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
    return bufferWriter.getBuffer();
};

const receiveAndValidateState = async (client, expectedState) => {
    const statePacket = await client.nextMessage(2);
    const { state } = unpackStatePacket(statePacket);
    assert.deepEqual(state, expectedState);
};

const unpackLoginSuccessResponsePacket = (loginSuccessResponsePacket) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(loginSuccessResponsePacket);
    const key = bufferReader.readUInt32LE();
    const result = bufferReader.readUInt8();

    return {
        key,
        result,
    };
};

const authPort = process.env.AUTH_SERVER_PORT;
const authHost = process.env.AUTH_SERVER_ADDRESS;

const connectToClient = async (host, port) => {
    const client = new SocketClient();
    await client.connect(host, port);
    return client;
};

export async function authFlow(user, password) {
    const client = await connectToClient(authHost, authPort);

    await receiveAndValidateState(client, ConnectionStateEnum.HANDSHAKE);

    const handshakeRequestPacket = await client.nextMessage(13);
    const { id, time, delta } = unpackHandshakePacket(handshakeRequestPacket);

    assert.ok(id);
    assert.ok(time);
    assert.deepEqual(delta, 0);

    const handshakeResponsePacket = createHandshakePacket(id, time, delta);
    client.sendMessage(handshakeResponsePacket);

    await receiveAndValidateState(client, ConnectionStateEnum.AUTH);

    const loginPacket = createLoginPacket(user, password, 123);
    client.sendMessage(loginPacket);

    const loginSuccessResponsePacket = await client.nextMessage(6);
    const { key: token, result } = unpackLoginSuccessResponsePacket(loginSuccessResponsePacket);

    assert.ok(token);
    assert.deepEqual(result, 1);

    return token;
}
