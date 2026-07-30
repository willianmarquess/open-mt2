import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #67: chat had no rate limit, so a client could
 * send as fast as it liked. The spam modules the public hacks ship do exactly
 * that, and because commands arrive through the chat packet, an unbounded rate
 * also meant unbounded command execution.
 *
 * The limit is asserted through its side effect: each accepted `/item` creates
 * a potion, so the resulting stack counts how many messages got through.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — chat flood protection (issue #67)', function () {
    this.timeout(60000);

    const USER = 'flood_test';
    const POTION = 27001;
    const BURST = 30;
    const MAX_PER_WINDOW = 10;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('caps a burst of chat commands instead of running all of them', async () => {
        session = await harness.login({ username: USER });

        // Spaced just enough that each packet arrives as its own read, since the
        // server handles one packet per socket event — but far faster than the
        // rate limit's window, which is what is under test here.
        for (let sent = 0; sent < BURST; sent++) {
            session.command(`/item ${POTION} 1`);
            await session.settle(15);
        }

        await session.settle(1500);

        const stacks = await session.dbItems(USER, POTION);
        const received = stacks.reduce((total, stack) => total + stack.count, 0);

        // The whole burst fits inside one window, so the cap is exact: the first
        // MAX_PER_WINDOW run and the rest are dropped.
        expect(received, `${MAX_PER_WINDOW} of ${BURST} commands ran`).to.equal(MAX_PER_WINDOW);

        // The connection is dropped by nothing: a flood costs the client its
        // extra messages, not its session.
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped').to.deep.equal([]);
    });
});
