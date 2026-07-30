import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

/**
 * Regression for issue #92: a header this server does not implement used to
 * flush the whole receive buffer, taking the packets behind it with it. The
 * real client sends CG_SYNC_POSITION on the game connection whenever it
 * flushes its victim list, so ordinary combat was dropping queued input.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — unimplemented header resync (issue #92)', function () {
    this.timeout(60000);

    const USER = 'resync_test';
    const POTION = 27001;
    const SYNC_POSITION_HEADER = 0x08;
    const ELEMENT_SIZE = 12;

    let harness: AttackHarness;
    let session: AttackSession;

    const chatCommand = (message: string) => {
        const size = 1 + 2 + 1 + message.length + 1;
        const writer = new BufferWriter(PacketHeaderEnum.CHAT_IN, size);
        return Buffer.concat([
            writer
                .writeUint16LE(size)
                .writeUint8(0)
                .writeString(message, message.length + 1)
                .getBuffer(),
            Buffer.of(0),
        ]);
    };

    /** What CPythonPlayerEventHandler::FlushVictimList puts on the wire. */
    const syncPosition = (elements: number) => {
        const declared = 3 + elements * ELEMENT_SIZE;
        const buffer = Buffer.alloc(declared + 1);
        buffer.writeUInt8(SYNC_POSITION_HEADER, 0);
        buffer.writeUInt16LE(declared, 1);
        return buffer;
    };

    const totalOf = async (protoId: number) => {
        const stacks = await session.dbItems(USER, protoId);
        return stacks.reduce((sum, stack) => sum + stack.count, 0);
    };

    before(async () => {
        harness = await new AttackHarness().start();
        session = await harness.login({ username: USER });
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('processes the packets queued behind a sync-position packet', async () => {
        session.send(Buffer.concat([syncPosition(2), chatCommand(`/item ${POTION} 5`)]));
        await session.settle(900);

        expect(await totalOf(POTION), 'the command behind sync position ran').to.equal(5);
    });

    it('keeps framing across a sync-position packet split over two writes', async () => {
        const packet = syncPosition(3);

        session.send(packet.subarray(0, 2));
        await session.settle(150);
        session.send(Buffer.concat([packet.subarray(2), chatCommand(`/item ${POTION} 3`)]));
        await session.settle(900);

        expect(await totalOf(POTION), 'the split packet was reassembled and skipped').to.equal(8);
    });

    it('still discards the buffer for a header nobody implements', async () => {
        session.send(Buffer.concat([Buffer.from([0xee]), chatCommand(`/item ${POTION} 3`)]));
        await session.settle(900);

        expect(await totalOf(POTION), 'a genuinely unknown header still loses framing').to.equal(8);

        session.send(chatCommand(`/item ${POTION} 3`));
        await session.settle(900);
        expect(await totalOf(POTION), 'and the connection survives it').to.equal(11);
    });
});
