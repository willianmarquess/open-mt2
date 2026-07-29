import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #69: a single item-drop packet with a count
 * larger than the stack must not be able to crash the whole game server.
 *
 * This drives real, potentially-malformed packets through an in-process game
 * server — the same technique used to originally confirm the exploit — and is a
 * template for the other security issues (#64-#68).
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — item drop count validation (issue #69)', function () {
    this.timeout(30000);

    const USER = 'dropx_test';
    const POTION = 27001;
    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('rejects a drop whose count exceeds the stack, without crashing the server', async () => {
        session = await harness.login({ username: USER });

        // Give ourselves a stack of 5 potions (lands at window 1, position 0).
        session.command(`/item ${POTION} 5`);
        await session.settle(600);
        const before = await session.dbItems(USER, POTION);
        expect(before, 'setup: one stack of 5 potions').to.deep.equal([{ count: 5, window: 1, position: 0 }]);

        session.flush();

        // The exploit: drop 200 out of a stack of 5.
        session.drop(1, 0, 0, 200);
        await session.settle(800);

        // 1) The server must still be up.
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);

        // 2) No unhandled rejection (the RangeError -> process.exit chain).
        expect(harness.capturedRejections(), 'no unhandled rejection escaped a packet handler').to.deep.equal([]);

        // 3) The stack must be untouched (or validly reduced) — never negative,
        //    never duplicated onto the ground.
        const after = await session.dbItems(USER, POTION);
        expect(after, 'stack unchanged after a rejected drop').to.deep.equal([{ count: 5, window: 1, position: 0 }]);
    });
});
