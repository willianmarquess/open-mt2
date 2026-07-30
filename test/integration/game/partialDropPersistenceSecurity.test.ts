import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #90: dropping part of a stack used to hand the
 * inventory instance itself to the ground and delete its database row, so the
 * stack that stayed behind was wiped on relog and the ground item was worth the
 * remainder instead of the dropped amount.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — partial drop persistence (issue #90)', function () {
    this.timeout(60000);

    const USER = 'partdrop_test';
    const POTION = 27001;
    const STACK = 200;
    const DROPPED = 1;

    let harness: AttackHarness;
    let session: AttackSession;

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

    it('keeps the surviving stack in the database and grounds only what was dropped', async () => {
        session.command(`/item ${POTION} ${STACK}`);
        await session.settle(600);
        expect(await totalOf(POTION), 'setup: the stack was granted').to.equal(STACK);

        session.drop(1, 0, 0, DROPPED);
        await session.settle(800);

        expect(await totalOf(POTION), 'the stack that stayed is still persisted').to.equal(STACK - DROPPED);

        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the item reached the ground').to.not.equal(undefined);
        expect(dropped!.getItem().getCount(), 'the ground item is worth the dropped amount').to.equal(DROPPED);
    });

    it('conserves the total when the dropped part is picked back up', async () => {
        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the previous drop is still on the ground').to.not.equal(undefined);

        session.pickup(dropped!.getVirtualId());
        await session.settle(800);

        expect(await totalOf(POTION), 'nothing was created or lost').to.equal(STACK);
    });
});
