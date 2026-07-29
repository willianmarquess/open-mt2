import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #65: the per-packet distance cap has no time
 * component, so a teleport hack walks through it with many small, individually
 * legal hops. This reproduces the public multihack's shape — 180-unit hops
 * every ~34ms, alternating the movement type between WAIT and MOVE — and
 * asserts the character cannot outrun its own movement speed.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — movement speed validation (issue #65)', function () {
    this.timeout(30000);

    const USER = 'speedx_test';
    const START_X = 958870;
    const START_Y = 272760;

    const HOP_DISTANCE = 180;
    const HOP_INTERVAL_MS = 34;
    const HOP_COUNT = 30;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('stops a hop-by-hop teleport from outrunning the character movement speed', async () => {
        session = await harness.login({ username: USER, x: START_X, y: START_Y });

        const player = harness.findPlayer(USER);
        expect(player, 'setup: the character is in the world').to.not.equal(undefined);

        expect(HOP_DISTANCE, 'setup: each hop clears the per-packet cap').to.be.lessThan(2500);

        for (let hop = 1; hop <= HOP_COUNT; hop++) {
            session.move(START_X + hop * HOP_DISTANCE, START_Y, hop % 2);
            await session.settle(HOP_INTERVAL_MS);
        }
        await session.settle(600);

        const claimed = HOP_COUNT * HOP_DISTANCE;
        const travelled = player.getPositionX() - START_X;
        const elapsed = HOP_COUNT * HOP_INTERVAL_MS;

        const distancePerMs = player.getMoveDistancePerMs();
        expect(distancePerMs, 'setup: the class has a run animation to bound').to.be.a('number');
        const entitled = distancePerMs * (elapsed + 600) * 2;

        expect(travelled, 'the hack did not reach where it claimed to be').to.be.lessThan(claimed);
        expect(travelled, 'movement stayed within what the speed allows').to.be.at.most(entitled);
        expect(await harness.isServerAlive(), 'server still accepting connections').to.equal(true);
        expect(harness.capturedRejections(), 'no unhandled rejection escaped').to.deep.equal([]);
    });

    it('lets a legitimate client walk at its own pace without being throttled', async () => {
        const player = harness.findPlayer(USER);
        const originX = player.getPositionX();
        const originY = player.getPositionY();

        // A real client reports its own position every ~300ms while moving.
        const distancePerMs = player.getMoveDistancePerMs();
        const stepInterval = 300;
        const step = Math.floor(distancePerMs * stepInterval);

        for (let i = 1; i <= 5; i++) {
            session.move(originX + i * step, originY, 1);
            await session.settle(stepInterval);
        }
        await session.settle(600);

        const travelled = player.getPositionX() - originX;

        expect(travelled, 'an honest walker kept moving').to.be.greaterThan(step);
    });
});
