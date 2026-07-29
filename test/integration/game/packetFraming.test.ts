import { expect } from 'chai';
import { createConnection } from 'node:net';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { container } from '@/game/Container';

/**
 * Regression for issue #76: TCP has no message boundaries, so packets that
 * coalesce into one read (or split across reads) must still all be processed.
 * Before the fix only the first packet of a read was handled and the rest were
 * silently discarded.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — TCP packet framing (issue #76)', function () {
    this.timeout(30000);

    const USER = 'framing_test';
    const POTION_A = 27001;
    const POTION_B = 27002;
    const POTION_C = 27004;
    let harness: AttackHarness;
    let session: AttackSession;

    const chatCommand = (message: string) => {
        const size = 1 + 2 + 1 + message.length + 1;
        const w = new BufferWriter(PacketHeaderEnum.CHAT_IN, size);
        return w
            .writeUint16LE(size)
            .writeUint8(0)
            .writeString(message, message.length + 1)
            .getBuffer();
    };

    const totalOf = async (protoId: number) => {
        const stacks = await session.dbItems(USER, protoId);
        return stacks.reduce((sum, stack) => sum + stack.count, 0);
    };

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('processes every packet when two commands coalesce into one TCP write', async () => {
        session = await harness.login({ username: USER });

        session.send(Buffer.concat([chatCommand(`/item ${POTION_A} 5`), chatCommand(`/item ${POTION_B} 5`)]));
        await session.settle(800);

        expect(await totalOf(POTION_A), 'first coalesced command landed').to.equal(5);
        expect(await totalOf(POTION_B), 'second coalesced command landed').to.equal(5);
    });

    it('reassembles a packet split across two TCP writes', async () => {
        const command = chatCommand(`/item ${POTION_C} 3`);

        session.send(command.subarray(0, 3));
        await session.settle(150);
        session.send(command.subarray(3));
        await session.settle(800);

        expect(await totalOf(POTION_C), 'split command landed').to.equal(3);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
    });

    it('drops the rest of a read after an unknown header but keeps the connection alive', async () => {
        session.send(Buffer.concat([Buffer.from([0xee]), chatCommand(`/item ${POTION_B} 3`)]));
        await session.settle(800);

        expect(await totalOf(POTION_B), 'command behind the unknown header was discarded').to.equal(5);

        session.send(chatCommand(`/item ${POTION_B} 3`));
        await session.settle(800);
        expect(await totalOf(POTION_B), 'connection still processes later packets').to.equal(8);
    });

    it('closes a connection whose packet claims an absurd length, without hurting the server', async () => {
        const config = container.resolve<any>('config');

        const kicked = await new Promise<boolean>((resolve) => {
            const probe = createConnection({ host: config.SERVER_ADDRESS, port: Number(config.SERVER_PORT) });
            const timer = setTimeout(() => {
                probe.destroy();
                resolve(false);
            }, 5000);
            const settle = (value: boolean) => {
                clearTimeout(timer);
                probe.destroy();
                resolve(value);
            };
            // Drain whatever the server sends (handshake) so the OS does not hold
            // the socket open waiting for us to read before surfacing the close.
            probe.on('data', () => {});
            probe.on('connect', () => {
                probe.write(
                    new BufferWriter(PacketHeaderEnum.CHAT_IN, 5).writeUint16LE(5000).writeUint8(0).getBuffer(),
                );
            });
            probe.on('close', () => settle(true));
            probe.on('end', () => settle(true));
            probe.on('error', () => settle(true));
        });

        expect(kicked, 'lying connection was closed').to.equal(true);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped').to.deep.equal([]);
    });
});
