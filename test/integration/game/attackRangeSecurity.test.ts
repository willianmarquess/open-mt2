import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Security regression for issue #68: the melee attack range must be enforced
 * server side. The victim is resolved from a global virtual id lookup, so an
 * attacker can name a monster anywhere in the world and hit it from off screen
 * if the range check is too permissive.
 *
 * A landed hit is asserted through the damage message the server sends back to
 * the attacker rather than through the monster's health, which regenerates on a
 * timer and would race the assertion.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — melee attack range (issue #68)', function () {
    this.timeout(60000);

    const SNIPER = 'sniper_test';
    const BRAWLER = 'brawler_test';
    const DAMAGE_MESSAGE = 'your damage is';
    const OUT_OF_RANGE = 1500;

    let harness: AttackHarness;
    let sniper: AttackSession;
    let brawler: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await sniper?.close();
        await brawler?.close();
        await harness?.stop();
    });

    it('ignores a melee attack from out of range, and still lands one up close', async () => {
        // Both the monster's own spot and the sniper's spot have to be owned by
        // the monster's area, or the character is dropped on spawn.
        await harness.awaitMonsterInPlace();
        const monster = harness
            .findMonsters()
            .find(
                (candidate) =>
                    candidate.getPoint(PointsEnum.HEALTH) > 0 &&
                    candidate.getArea() &&
                    harness.areaAt(candidate.getPositionX(), candidate.getPositionY()) === candidate.getArea() &&
                    harness.areaAt(candidate.getPositionX() + OUT_OF_RANGE, candidate.getPositionY()) ===
                        candidate.getArea(),
            );

        expect(monster, 'setup: the world spawned a monster with room to stand back from').to.not.equal(undefined);

        const virtualId = monster!.getVirtualId();

        sniper = await harness.login({
            username: SNIPER,
            x: monster!.getPositionX() + OUT_OF_RANGE,
            y: monster!.getPositionY(),
        });

        expect(harness.findPlayer(SNIPER), 'setup: the sniper is in the world').to.not.equal(undefined);

        // Both characters log in before either attacks: a provoked monster
        // charges off its spawn cell, and the cell next to it belongs to no
        // area, so a later login at its position would be dropped.
        brawler = await harness.login({
            username: BRAWLER,
            x: monster!.getPositionX(),
            y: monster!.getPositionY(),
        });

        expect(harness.findPlayer(BRAWLER), 'setup: the brawler is in the world').to.not.equal(undefined);

        // The damage line is debug output now, so it has to be switched on or
        // both assertions below would be vacuously false.
        sniper.command('/debug');
        await sniper.settle(400);

        sniper.flush();
        sniper.attack(virtualId);
        await sniper.settle(600);

        expect(sniper.received().includes(DAMAGE_MESSAGE), 'no damage dealt from out of range').to.equal(false);

        // Positive control: the same packet from a character standing on the
        // monster does land, so the rejection above was the range check.
        brawler.command('/debug');
        await brawler.settle(400);

        brawler.flush();
        brawler.attack(virtualId);
        await brawler.settle(600);

        expect(brawler.received().includes(DAMAGE_MESSAGE), 'damage dealt from melee range').to.equal(true);
    });
});
