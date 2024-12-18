import { expect } from 'chai';
import SocketClient from '../../support/SocketClient';
import BufferWriter from '../../../src/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '../../../src/core/enum/PacketHeaderEnum';
import BufferReader from '../../../src/core/interface/networking/buffer/BufferReader';
import ConnectionStateEnum from '../../../src/core/enum/ConnectionStateEnum';
import LoginStatusEnum from '../../../src/core/enum/LoginStatusEnum';

const port = process.env.AUTH_SERVER_PORT;
const host = process.env.AUTH_SERVER_ADDRESS;

const createLoginPacket = (user, password, key) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.LOGIN_REQUEST, 66);
    bufferWriter.writeString(user, 31);
    bufferWriter.writeString(password, 16);
    bufferWriter.writeUint32LE(key);
    return bufferWriter.buffer;
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

const unpackLoginErrorResponsePacket = (loginErrorResponsePacket) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(loginErrorResponsePacket);
    const status = bufferReader.readString();

    return {
        status,
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

const unpackStatePacket = (buffer) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);
    const state = bufferReader.readUInt8();
    return {
        state,
    };
};

const createHandshakePacket = (id, time, delta) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.HANDSHAKE, 13);
    bufferWriter.writeUint32LE(id).writeUint32LE(time).writeUint32LE(delta);
    return bufferWriter.buffer;
};

const receiveAndValidateState = async (client, expectedState) => {
    const statePacket = await client.nextMessage(2);
    const { state } = unpackStatePacket(statePacket);
    expect(state).to.be.equal(expectedState);
};

describe('Auth Flow', () => {
    let client;

    beforeEach(async () => {
        client = new SocketClient();
        await client.connect(host, port);
    });

    afterEach(async () => {
        await client.close();
    });

    describe('when try login flow with valid login and password', () => {
        it('should process login flow correctly', async () => {
            //receive handshake state
            await receiveAndValidateState(client, ConnectionStateEnum.HANDSHAKE);

            //receive handshake packet
            const handshakeRequestPacket = await client.nextMessage(13);
            const { id, time, delta } = unpackHandshakePacket(handshakeRequestPacket);

            expect(id).to.be.a('number');
            expect(time).to.be.a('number');
            expect(delta).to.be.a('number');
            expect(delta).to.be.equal(0);

            //send handshake packet to server validate it
            const handshakeResponsePacket = createHandshakePacket(id, time, delta);
            client.sendMessage(handshakeResponsePacket);

            //receive state auth
            await receiveAndValidateState(client, ConnectionStateEnum.AUTH);

            //send login request packet to server validate it
            const loginPacket = createLoginPacket('admin', 'admin', 123);
            client.sendMessage(loginPacket);

            //receive login response with code 1 (success)
            const loginSuccessResponsePacket = await client.nextMessage(6);
            const { key: token, result } = unpackLoginSuccessResponsePacket(loginSuccessResponsePacket);

            expect(token).to.be.a('number');
            expect(result).to.be.equal(1);
        });
    });

    describe('when try login flow with invalid login and password', () => {
        it('should process login flow correctly with error login code', async () => {
            //receive handshake state
            await receiveAndValidateState(client, ConnectionStateEnum.HANDSHAKE);

            //receive handshake packet
            const handshakeRequestPacket = await client.nextMessage(13);
            const { id, time, delta } = unpackHandshakePacket(handshakeRequestPacket);

            expect(id).to.be.a('number');
            expect(time).to.be.a('number');
            expect(delta).to.be.a('number');
            expect(delta).to.be.equal(0);

            //send handshake packet to server validate it
            const handshakeResponsePacket = createHandshakePacket(id, time, delta);
            client.sendMessage(handshakeResponsePacket);

            //receive state auth
            await receiveAndValidateState(client, ConnectionStateEnum.AUTH);

            //send login request packet to server validate it
            const loginPacket = createLoginPacket('adminn', 'adminn', 123);
            client.sendMessage(loginPacket);

            //receive login response with error (WRONGPWD)
            const loginErrorResponsePacket = await client.nextMessage(10);
            const { status } = unpackLoginErrorResponsePacket(loginErrorResponsePacket);

            expect(status).to.be.equal(LoginStatusEnum.LOGIN_OR_PASS_INCORRECT);
        });
    });
});
