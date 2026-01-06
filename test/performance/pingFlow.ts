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

const computeMetrics = (values: number[]) => {
    const n = values.length;
    if (n === 0) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = sum / n;
    const min = sorted[0];
    const max = sorted[n - 1];
    const percentile = (p: number) => {
        const idx = Math.ceil(p * n) - 1;
        return sorted[Math.max(0, Math.min(n - 1, idx))];
    };
    const median = percentile(0.5);
    const p90 = percentile(0.9);
    const p99 = percentile(0.99);
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);

    return {
        count: n,
        min,
        max,
        mean,
        median,
        p90,
        p99,
        stddev,
    };
};

class PingFlow {
    client!: SocketClient;
    pingInterval?: NodeJS.Timeout;
    sentPackets = 0;
    receivedPackets = 0;
    allPings: number[] = pings;
    warmupCount = 10;
    warmupIgnored = 0;

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

        this.pingInterval = setInterval(() => {
            this.client.sendMessage(createPingPacket());
            this.sentPackets++;
        }, 1_000);

        this.client.setOnData((data: Buffer<ArrayBufferLike>) => {
            if (data[0] === PacketHeaderEnum.INTERNAL_PONG) {
                const { time } = unpackPingPacket(data);
                const diff = performance.now() - time;

                if (this.warmupIgnored < this.warmupCount) {
                    this.warmupIgnored++;
                    if (this.warmupIgnored === this.warmupCount) {
                        console.log(`warmup complete (${this.warmupCount} samples ignored). Collecting metrics...`);
                    }
                    this.client.flush();
                    return;
                }

                this.allPings.push(diff);
                this.receivedPackets++;

                if (this.allPings.length % 10 === 0) {
                    const last10 = this.allPings.slice(-10);
                    const avg = last10.reduce((a, b) => a + b, 0) / last10.length;
                    console.log(`last 10 average ping: ~${avg.toFixed(2)}ms`);
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

    async shutdownAndPrintMetrics() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        await this.close().catch((err) => console.log('err when try to close connection', err));

        const metrics = computeMetrics(this.allPings);
        console.log('\n--- Performance Metrics ---');
        console.log(`ignored warmup samples: ${this.warmupIgnored}`);
        console.log(`sent packets: ${this.sentPackets}`);
        console.log(`received packets: ${this.receivedPackets}`);
        if (!metrics) {
            console.log('no ping samples collected');
            return;
        }

        console.log(`count: ${metrics.count}`);
        console.log(`min: ${metrics.min.toFixed(2)}ms`);
        console.log(`max: ${metrics.max.toFixed(2)}ms`);
        console.log(`mean: ${metrics.mean.toFixed(2)}ms`);
        console.log(`median (p50): ${metrics.median.toFixed(2)}ms`);
        console.log(`p90: ${metrics.p90.toFixed(2)}ms`);
        console.log(`p99: ${metrics.p99.toFixed(2)}ms`);
        console.log(`stddev: ${metrics.stddev.toFixed(2)}ms`);
        console.log('---------------------------\n');
    }
}

(async () => {
    const pingFlow = new PingFlow();
    await pingFlow.connect();
    await pingFlow.basicFlow();

    const handleShutdown = async (signal?: string) => {
        console.log(`\nShutting down${signal ? ` (${signal})` : ''}...`);
        try {
            await pingFlow.shutdownAndPrintMetrics();
        } catch (err) {
            console.error('error during shutdown:', err);
        }
        setTimeout(() => process.exit(0), 50);
    };

    process.on('SIGINT', () => void handleShutdown('SIGINT'));
    process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
    process.on('beforeExit', () => void handleShutdown('beforeExit'));
})();
