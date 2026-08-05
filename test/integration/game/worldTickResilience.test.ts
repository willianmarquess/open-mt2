import { expect } from 'chai';
import { container } from '@/game/Container';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Covers issue #81: one broken entity must not stop the world tick. The spec
 * injects an entity whose tick always throws — the exact amplification that
 * turned the #73 data bug into a whole-server outage — and asserts the throw
 * neither escapes as an unhandled rejection nor freezes the world.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Resilience — world tick survives a broken entity (issue #81)', function () {
    this.timeout(60000);

    const SURVIVOR = 'tick_survivor_test';
    const BROKEN_VID = 0x7fffffff;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('keeps ticking and serving logins while an entity keeps throwing', async () => {
        const entityManager = container.resolve<any>('entityManager');
        const rejectionsBefore = harness.capturedRejections().length;

        entityManager.entities.set(BROKEN_VID, {
            tick: () => {
                throw new Error('broken entity (issue #81 spec)');
            },
        });

        try {
            // A few tick periods at 20Hz, each hitting the broken entity.
            await new Promise((resolve) => setTimeout(resolve, 300));

            expect(
                harness.capturedRejections().length,
                'the tick loop caught the throw instead of dying on an unhandled rejection',
            ).to.equal(rejectionsBefore);

            // The world is still alive end-to-end: a login needs spawn queues
            // and entity ticks to be processed, none of which happen once the
            // loop is dead.
            session = await harness.login({ username: SURVIVOR });
            expect(harness.findPlayer(SURVIVOR), 'a new character still enters the world').to.not.equal(undefined);
        } finally {
            entityManager.entities.delete(BROKEN_VID);
        }
    });
});
