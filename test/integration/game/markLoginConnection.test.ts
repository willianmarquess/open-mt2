import { expect } from 'chai';
import { createConnection, Socket } from 'node:net';
import { container } from '@/game/Container';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import AttackHarness from '../../support/AttackSession';

/**
 * Regression for issue #146: the client's guild-mark downloader opens a second
 * connection to this port, handshakes and sends MARK_LOGIN. We are not a mark
 * server, so the connection has to be released instead of sitting there forever.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Guild-mark connection (issue #146)', function () {
    this.timeout(60000);

    // The literal header, not the enum, so this spec runs identically on a tree
    // that does not know MARK_LOGIN yet.
    const MARK_LOGIN_HEADER = 100;
    const MARK_LOGIN_HANDLE = 0x0badf00d;
    const MARK_LOGIN_RANDOM_KEY = 0x12345678;

    let harness: AttackHarness;
    let socket: Socket;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        socket?.destroy();
        await harness?.stop();
    });

    /** A raw connection that mimics CGuildMarkDownloader: handshake, then MARK_LOGIN. */
    const markConnection = () => {
        const host = container.resolve<any>('config').SERVER_ADDRESS as string;
        const port = Number(container.resolve<any>('config').SERVER_PORT);

        let buffer = Buffer.alloc(0);
        let closed = false;

        const client = createConnection({ host, port });
        client.on('data', (chunk) => (buffer = Buffer.concat([buffer, chunk])));
        client.on('close', () => (closed = true));

        const next = (length: number) =>
            new Promise<Buffer>((resolve) => {
                const tick = () => {
                    if (buffer.byteLength >= length) {
                        const out = buffer.subarray(0, length);
                        buffer = buffer.subarray(length);
                        return resolve(out);
                    }
                    setTimeout(tick, 20);
                };
                tick();
            });

        const closedWithin = async (ms: number) => {
            for (let waited = 0; waited < ms && !closed; waited += 50) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            return closed;
        };

        return { client, next, closedWithin };
    };

    it('should close a connection that asks to log in as a guild mark client', async () => {
        const { client, next, closedWithin } = markConnection();
        socket = client;

        await next(2);
        const handshake = await next(13);
        const reader = new BufferReader();
        reader.setBuffer(handshake);
        const id = reader.readUInt32LE();
        const time = reader.readUInt32LE();
        const delta = reader.readUInt32LE();

        client.write(
            new BufferWriter(PacketHeaderEnum.HANDSHAKE, 13)
                .writeUint32LE(id)
                .writeUint32LE(time)
                .writeUint32LE(delta)
                .getBuffer(),
        );

        client.write(
            new BufferWriter(MARK_LOGIN_HEADER, 9)
                .writeUint32LE(MARK_LOGIN_HANDLE)
                .writeUint32LE(MARK_LOGIN_RANDOM_KEY)
                .getBuffer(),
        );

        expect(await closedWithin(5_000), 'the mark connection was released').to.equal(true);
        expect(await harness.isServerAlive(), 'the server stayed up').to.equal(true);
    });
});
