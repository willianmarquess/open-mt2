import { expect } from 'chai';
import sinon from 'sinon';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import { container } from '@/game/Container';

/**
 * Security regression for issue #83: item pickup resolved the virtual id it was
 * given without checking the entity is a ground item, so aiming it at a player
 * or a monster threw inside the service. The handler never awaited it, so the
 * rejection reached the process-level handler and exited the server.
 *
 * The awaited handler alone keeps the server up, so what pins the type guard is
 * the assertion that nothing was thrown at all. Both cases also have to share an
 * area with their target, otherwise the map check rejects the pickup first and
 * the guard is never reached.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — item pickup entity type (issue #83)', function () {
    this.timeout(60000);

    const USER = 'picktype_test';
    const HUNTER = 'picktypemob_test';
    const POTION = 27001;

    let harness: AttackHarness;
    let session: AttackSession;
    let hunter: AttackSession;
    let loggedErrors: sinon.SinonSpy;

    /** Errors the pickup service logged while handling the packet, if any. */
    const thrownInPickup = () =>
        loggedErrors
            .getCalls()
            .map((call) => String(call.args[0]?.stack ?? call.args[0] ?? ''))
            .filter((entry) => entry.includes('PickupItemService'));

    before(async () => {
        harness = await new AttackHarness().start();
        session = await harness.login({ username: USER });
    });

    after(async () => {
        await session?.close();
        await hunter?.close();
        await harness?.stop();
    });

    beforeEach(function () {
        loggedErrors = sinon.spy(container.resolve<any>('logger'), 'error');
    });

    afterEach(function () {
        loggedErrors.restore();
    });

    it('ignores a pickup aimed at the sender, without throwing', async () => {
        const ownVirtualId = harness.findPlayer(USER)?.getVirtualId();
        expect(ownVirtualId, 'setup: the attacker is in the world').to.not.equal(undefined);

        session.pickup(ownVirtualId!);
        await session.settle(800);

        expect(thrownInPickup(), 'the pickup service did not throw').to.deep.equal([]);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped the handler').to.deep.equal([]);
        expect(harness.findPlayer(USER), 'the sender is untouched').to.not.equal(undefined);
    });

    it('ignores a pickup aimed at a monster, without throwing', async () => {
        const monster = await harness.awaitMonsterInPlace();

        expect(monster, 'setup: a monster spawned and is standing on its own area').to.not.equal(undefined);

        hunter = await harness.login({
            username: HUNTER,
            x: monster!.getPositionX(),
            y: monster!.getPositionY(),
        });

        expect(harness.findPlayer(HUNTER)!.getArea(), 'setup: standing on the monster').to.equal(monster!.getArea());

        hunter.pickup(monster!.getVirtualId());
        await hunter.settle(800);

        expect(thrownInPickup(), 'the pickup service did not throw').to.deep.equal([]);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped the handler').to.deep.equal([]);
    });

    // Positive control: the guard rejects other entity types without also
    // breaking the case it is meant to allow.
    it('still picks up a real ground item', async () => {
        session.command(`/item ${POTION} 3`);
        await session.settle(600);

        session.drop(1, 0, 0, 3);
        await session.settle(600);

        const dropped = harness.findDroppedItem();
        expect(dropped, 'setup: the item reached the ground').to.not.equal(undefined);
        const virtualId = dropped!.getVirtualId();

        session.pickup(virtualId);
        await session.settle(600);

        expect(harness.findEntity(virtualId), 'the ground item was picked up').to.equal(undefined);
        expect(thrownInPickup(), 'the pickup service did not throw').to.deep.equal([]);
    });
});
