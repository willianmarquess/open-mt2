import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #66: picking an item up off the ground must be
 * validated against the picker's position and ownership, not just the virtual id
 * the client sends. Virtual ids are sequential, so an attacker can name an item
 * they were never shown.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — item pickup validation (issue #66)', function () {
    this.timeout(60000);

    const OWNER = 'pickowner_test';
    const THIEF = 'pickthief_test';
    const POTION = 27001;
    const X = 958870;
    const Y = 272760;
    const FAR = 2000; // well beyond the 300 pickup range, still the same map

    let harness: AttackHarness;
    let owner: AttackSession;
    let thief: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await owner?.close();
        await thief?.close();
        await harness?.stop();
    });

    it('ignores a pickup sent from out of range, and still allows the owner nearby', async () => {
        owner = await harness.login({ username: OWNER, x: X, y: Y });
        thief = await harness.login({ username: THIEF, x: X + FAR, y: Y });

        owner.command(`/item ${POTION} 5`);
        await owner.settle(600);

        owner.drop(1, 0, 0, 5);
        await owner.settle(600);

        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the item reached the ground').to.not.equal(undefined);
        const virtualId = dropped!.getVirtualId();

        // Both players must share an area, otherwise the map check — not the
        // distance check — would be what rejects the pickup.
        expect(
            harness.findPlayer(THIEF)?.getArea(),
            'setup: attacker is on the same map, only further away',
        ).to.equal(harness.findPlayer(OWNER)?.getArea());

        thief.pickup(virtualId);
        await thief.settle(600);

        expect(harness.findDroppedItem()?.getVirtualId(), 'item still on the ground after a far pickup').to.equal(
            virtualId,
        );
        expect(await thief.dbItems(THIEF, POTION), 'attacker received nothing').to.deep.equal([]);

        // Positive control: the same packet from the owner standing on it works,
        // so the rejection above was the distance and not a broken flow.
        owner.pickup(virtualId);
        await owner.settle(600);

        expect(harness.findDroppedItem(), 'owner nearby picked it up').to.equal(undefined);
    });

    // The gold half of #66 is covered by the PickupItemService unit tests: gold
    // cannot reach the ground here, because dropping it throws inside the area
    // spawn queue (the gold "item" is a plain object without getId).
});
