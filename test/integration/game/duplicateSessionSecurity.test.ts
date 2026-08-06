import { expect } from 'chai';
import { createConnection, Socket } from 'node:net';
import { container } from '@/game/Container';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import BufferReader from '@/core/interface/networking/buffer/BufferReader';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';
import AttackHarness from '../../support/AttackSession';

/**
 * Regression for issue #105: nothing stopped one account from holding two live
 * sessions, which let a character duplicate its own gold and items by dropping
 * on one session and picking up on the other.
 *
 * The second session is opened with its OWN freshly minted token, not a replay
 * of the first one - a replay is refused earlier by the single-use token fix
 * (issue #104), which would make this spec pass for the wrong reason.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Duplicate session per account (issue #105)', function () {
    this.timeout(60_000);

    const USERNAME = 'dupsession_test';
    const SECOND_TOKEN = 0x0dd0dd0d;

    let harness: AttackHarness;
    let firstSession: Awaited<ReturnType<AttackHarness['login']>> | undefined;
    let secondSocket: Socket | undefined;

    const db = () => container.resolve('databaseManager') as any;
    const cache = () => container.resolve('cacheProvider') as any;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        secondSocket?.destroy();
        // Closed explicitly rather than relying on the guard having kicked it:
        // when the fix regresses, the first session would otherwise survive
        // into the next spec file and take unrelated cases down with it.
        await firstSession?.close();
        await harness?.stop();
    });

    const accountIdOf = async (username: string) => {
        const [rows] = await db().getConnection().query('SELECT id FROM auth.account WHERE username = ?', [username]);
        return rows[0].id as number;
    };

    /** A raw connection that walks the handshake and then redeems a token. */
    const tokenConnection = () => {
        const host = container.resolve<any>('config').SERVER_ADDRESS as string;
        const port = Number(container.resolve<any>('config').SERVER_PORT);

        let buffer = Buffer.alloc(0);
        let closed = false;

        const client = createConnection({ host, port });
        client.on('data', (chunk) => (buffer = Buffer.concat([buffer, chunk])));
        client.on('close', () => (closed = true));
        client.on('error', () => (closed = true));

        const next = (length: number, timeoutMs = 10_000) =>
            new Promise<Buffer>((resolve, reject) => {
                const deadline = Date.now() + timeoutMs;
                const tick = () => {
                    if (buffer.byteLength >= length) {
                        const out = buffer.subarray(0, length);
                        buffer = buffer.subarray(length);
                        return resolve(out);
                    }
                    if (Date.now() > deadline) return reject(new Error(`timed out waiting for ${length} bytes`));
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

        const handshake = async () => {
            await next(2);
            const frame = await next(13);
            const reader = new BufferReader();
            reader.setBuffer(frame);
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
            await next(2);
        };

        const sendToken = (username: string, token: number) => {
            const auth = new BufferWriter(PacketHeaderEnum.TOKEN, 52);
            auth.writeString(username, 31)
                .writeUint32LE(token)
                .writeUint32LE(0)
                .writeUint32LE(0)
                .writeUint32LE(0)
                .writeUint32LE(0);
            client.write(Buffer.concat([auth.getBuffer(), Buffer.from([0])]));
        };

        return { client, next, closedWithin, handshake, sendToken };
    };

    it('should refuse a second session on an account that is already connected', async () => {
        firstSession = await harness.login({ username: USERNAME });
        expect(harness.findPlayer(USERNAME), 'the first session is in the world').to.not.equal(undefined);

        const accountId = await accountIdOf(USERNAME);
        await cache().set(
            CacheKeyGenerator.createTokenKey(String(SECOND_TOKEN)),
            JSON.stringify({ username: USERNAME, accountId }),
            300,
        );

        const second = tokenConnection();
        secondSocket = second.client;
        await second.handshake();
        second.sendToken(USERNAME, SECOND_TOKEN);

        const failure = await second.next(10);
        expect(failure[0], 'the newcomer is answered with LOGIN_FAILED').to.equal(PacketHeaderEnum.LOGIN_FAILED);
        expect(failure.subarray(1).toString('latin1').replace(/\0.*$/, ''), 'with the ALREADY status').to.equal(
            'ALREADY',
        );

        expect(await second.closedWithin(5_000), 'and is then dropped').to.equal(true);
        expect(await harness.isServerAlive(), 'the server stayed up').to.equal(true);
    });
});
