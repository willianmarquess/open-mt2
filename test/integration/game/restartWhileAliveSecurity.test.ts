import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for the restart-while-alive gap (#87). Neither restart command
 * checked that the character was dead, and the restart path re-spawns the
 * entity — which re-runs the full point recalculation and resets health and
 * mana. A living character could therefore heal to full on demand.
 *
 * Asserted on the live server-side entity rather than on packets: the heal is
 * a server-state change, and the client is only told about it afterwards.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — restart requires death', function () {
    this.timeout(60000);

    const HEALER = 'healer_test';

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    it('does not heal a living character on /restart_here', async () => {
        session = await harness.login({ username: HEALER });

        const player = harness.findPlayer(HEALER);
        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        const maxHealth = player.getPoint(PointsEnum.MAX_HEALTH);
        player.addPoint(PointsEnum.HEALTH, -Math.floor(maxHealth * 0.9));

        const wounded = player.getPoint(PointsEnum.HEALTH);
        expect(wounded, 'setup: the character is wounded').to.be.lessThan(Math.floor(maxHealth / 2));
        expect(player.isDead(), 'setup: the character is alive').to.equal(false);

        session.command('/restart_here');
        await session.settle(800);

        // Regeneration ticks every 3s and would only add a small amount, so a
        // jump back to the full bar can only come from the respawn path.
        expect(player.getPoint(PointsEnum.HEALTH), 'the restart did not refill the bar').to.be.lessThan(
            Math.floor(maxHealth / 2),
        );
    });

    it('does not warp a living character on /restart_town', async () => {
        const player = harness.findPlayer(HEALER);

        const x = player.getPositionX();
        const y = player.getPositionY();

        session.command('/restart_town');
        await session.settle(800);

        expect(player.getPositionX(), 'the character stayed put').to.equal(x);
        expect(player.getPositionY(), 'the character stayed put').to.equal(y);
    });
});
