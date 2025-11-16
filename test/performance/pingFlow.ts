import assert from 'node:assert';
import SocketClient from '../support/SocketClient';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

const port = process.env.GAME_SERVER_PORT!;
const host = process.env.GAME_SERVER_ADDRESS!;

const connectToClient = async (host: string, port: number) => {
    const client = new SocketClient();
    await client.connect(host, port);
    return client;
};

const receiveAndValidateState = async (client: SocketClient, expectedState: number) => {
    const statePacket = await client.nextMessage(2);
    const { state } = unpackStatePacket(statePacket);
    assert.deepStrictEqual(state, expectedState);
};

const unpackStatePacket = (buffer: Buffer<ArrayBufferLike>) => {
    const bufferReader = new BufferReader();
    bufferReader.setBuffer(buffer);
    const state = bufferReader.readUInt8();
    return {
        state,
    };
};

const unpackHandshakePacket = (buffer: Buffer<ArrayBufferLike>) => {
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

const createHandshakePacket = (id: number, time: number, delta: number) => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.HANDSHAKE, 13);
    bufferWriter.writeUint32LE(id).writeUint32LE(time).writeUint32LE(delta);
    return bufferWriter.getBuffer();
};

const createPingPacket = () => {
    const bufferWriter = new BufferWriter(PacketHeaderEnum.INTERNAL_PING, 5);
    bufferWriter.writeUint32LE(performance.now());
    return bufferWriter.getBuffer();
};

const unpackPingPacket = (buffer: Buffer<ArrayBufferLike>) => {
    if (buffer.length === 5) {
        const bufferReader = new BufferReader();
        bufferReader.setBuffer(buffer);
        const time = bufferReader.readUInt32LE();
        return {
            time,
        };
    }

    return {
        time: 0,
    };
};

const pings: Array<number> = [];

class PingFlow {
    client!: SocketClient;

    async connect() {
        this.client = await connectToClient(host, Number(port));
    }

    async basicFlow() {
        await receiveAndValidateState(this.client, ConnectionStateEnum.HANDSHAKE);

        const handshakeRequestPacket = await this.client.nextMessage(13);
        const { id, time, delta } = unpackHandshakePacket(handshakeRequestPacket);

        assert.ok(id);
        assert.ok(time);
        assert.deepStrictEqual(delta, 0);

        const handshakeResponsePacket = createHandshakePacket(id, time, delta);
        this.client.sendMessage(handshakeResponsePacket);

        setInterval(() => this.client.sendMessage(createPingPacket()), 1_000);
        this.client.setOnData((data: Buffer<ArrayBufferLike>) => {
            if (data[0] === PacketHeaderEnum.INTERNAL_PONG) {
                const { time } = unpackPingPacket(data);
                const diff = performance.now() - time;
                pings.push(diff);
                if (pings.length === 10) {
                    const averageTick = pings.reduce((acc, curr) => acc + curr, 0);
                    console.log(`average pings is: ~${(averageTick / 10).toFixed(2)}ms`);
                    pings.length = 0;
                }

                this.client.flush();
            }
        });
    }

    async close() {
        return this.client.close();
    }

    flush() {
        return this.client.flush();
    }
}

(async () => {
    const pingFlow = new PingFlow();
    await pingFlow.connect();
    await pingFlow.basicFlow();
})();
