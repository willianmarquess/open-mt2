import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';

/**
 * Security regression for issue #91: the drain loop did not consult the
 * connection between frames, so once a handler closed it the remaining packets
 * of the same TCP read still executed — on a player that was already being
 * logged out.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — drain loop stops at close (issue #91)', function () {
    this.timeout(60000);

    const USER = 'drainclose_test';
    const POTION = 27001;

    let harness: AttackHarness;
    let session: AttackSession;

    // Built by hand so the bytes can be packed into a single TCP write. The
    // trailing byte is the sequence byte the real client appends.
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

    /** Slot 200 is outside the 0..36 the validator allows, so the handler closes. */
    const rejectedQuickSlot = () =>
        Buffer.concat([
            new BufferWriter(PacketHeaderEnum.QUICK_SLOT_ADD_REQUEST, 4)
                .writeUint8(200)
                .writeUint8(0)
                .writeUint8(0)
                .getBuffer(),
            Buffer.of(0),
        ]);

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

    it('does not run the packets queued behind one that closes the connection', async () => {
        expect(await totalOf(POTION), 'setup: the player owns nothing yet').to.equal(0);

        session.send(
            Buffer.concat([rejectedQuickSlot(), chatCommand(`/item ${POTION} 5`), chatCommand(`/item ${POTION} 5`)]),
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        expect(await totalOf(POTION), 'nothing behind the closing packet executed').to.equal(0);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped').to.deep.equal([]);
    });
});
