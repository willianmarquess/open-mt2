import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import { PointsEnum } from '@/core/enum/PointsEnum';

/**
 * Security regression for issue #84: picking an item up only enqueues its
 * despawn, so the entity stays resolvable until the next world tick. Without a
 * claim flag every repeated ITEM_PICKUP for the same virtual id completed in
 * full, crediting the loot once per packet.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — item pickup idempotency (issue #84)', function () {
    this.timeout(60000);

    const USER = 'pickdupe_test';
    const POTION = 27001;
    const GOLD_DROP = 100_000;
    const REPEATS = 10;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
        session = await harness.login({ username: USER });
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('credits dropped gold once even when the pickup packet is repeated', async () => {
        const player = harness.findPlayer(USER);
        expect(player, 'setup: the player is in the world').to.not.equal(undefined);

        session.drop(1, 0, GOLD_DROP, 0);
        await session.settle(600);

        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the gold reached the ground').to.not.equal(undefined);
        const virtualId = dropped!.getVirtualId();

        const goldBefore = player!.getPoint(PointsEnum.GOLD);

        // One TCP write, so every repeat is drained inside the same world tick,
        // before the despawn queue has had a chance to run.
        for (let repeat = 0; repeat < REPEATS; repeat++) {
            session.pickup(virtualId);
        }
        await session.settle(1000);

        expect(player!.getPoint(PointsEnum.GOLD) - goldBefore, 'gold credited exactly once').to.equal(GOLD_DROP);
    });

    it('adds a dropped stack once even when the pickup packet is repeated', async () => {
        session.command(`/item ${POTION} 200`);
        await session.settle(600);

        const owned = await session.dbItems(USER, POTION);
        const totalBefore = owned.reduce((sum, stack) => sum + stack.count, 0);
        expect(totalBefore, 'setup: the stack was granted').to.equal(200);

        session.drop(1, 0, 0, 200);
        await session.settle(600);

        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the stack reached the ground').to.not.equal(undefined);
        const virtualId = dropped!.getVirtualId();

        for (let repeat = 0; repeat < REPEATS; repeat++) {
            session.pickup(virtualId);
        }
        await session.settle(1200);

        const after = await session.dbItems(USER, POTION);
        const totalAfter = after.reduce((sum, stack) => sum + stack.count, 0);

        expect(totalAfter, 'the stack survives exactly once').to.equal(200);
        expect(after.length, 'no duplicate rows inserted').to.equal(1);
    });
});
