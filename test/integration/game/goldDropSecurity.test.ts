import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression: dropping gold used to kill the world loop.
 *
 * dropGold handed a plain `{ id, count }` object to the drop pipeline instead of
 * an Item, so when the ground entity spawned, notifying the nearby player
 * through Player.onNearbyEntityAdded called `getItem().getId()` on a plain
 * object. The throw escaped Area.processSpawnQueue into World.tick, whose
 * setTimeout reschedule is the last statement and was never reached — the world
 * stopped ticking for every player on the server, and the dropped gold was lost
 * after the player had already been charged.
 *
 * Dropping gold is an ordinary action, so this needed no crafted packet at all.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — dropping gold keeps the world alive', function () {
    this.timeout(60000);

    const USER = 'golddrop_test';
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

    it('lands the gold on the ground and keeps spawning afterwards', async () => {
        session = await harness.login({ username: USER });

        session.command(`/item ${POTION} 5`);
        await session.settle(600);

        expect(await session.dbItems(USER, POTION), 'setup: one stack of 5 potions').to.deep.equal([
            { count: 5, window: 1, position: 0 },
        ]);

        session.drop(1, 0, 5000, 0);
        await session.settle(800);

        const gold = harness.findDroppedItem();
        expect(gold, 'the gold reached the ground').to.not.equal(undefined);
        expect(gold!.getItem().getId(), 'the ground entity carries the gold proto').to.equal(1);
        expect(gold!.getCount(), 'for the amount that was dropped').to.equal(5000);

        // The throw used to escape into World.tick and stop the reschedule, so
        // anything queued to spawn after it was silently lost.
        session.drop(1, 0, 0, 5);
        await session.settle(1500);

        expect(harness.findDroppedItem()?.getVirtualId(), 'the world still spawns after a gold drop').to.not.equal(
            gold!.getVirtualId(),
        );
        expect(harness.capturedRejections(), 'no unhandled rejection escaped the tick').to.deep.equal([]);
    });
});
