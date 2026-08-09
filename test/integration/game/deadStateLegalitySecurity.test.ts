import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for the dead-state legality gap. Dying sets PositionEnum.DEAD on the
 * character and ConnectionStateEnum.DEAD on the connection, but nothing reads
 * either one: `Player.restart` puts the character back in the world without
 * clearing the dead position or restoring health, and `Player.attack` sets the
 * attacker to FIGHTING before the damage runs, so a dead character revives itself
 * by swinging at anything.
 *
 * Both cases are asserted on the live server-side entity rather than on packets,
 * because the client is never told about either transition — that desync is part
 * of what makes the gap invisible in play.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — dead state legality', function () {
    this.timeout(60000);

    const RESTARTER = 'restarter_test';
    const SWINGER = 'swinger_test';
    const DAMAGE_MESSAGE = 'your damage is';

    let harness: AttackHarness;
    let restarter: AttackSession;
    let swinger: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await restarter?.close();
        await swinger?.close();
        await harness?.stop();
    });

    // Mobs reach the world through the area spawn queue, so it takes a few ticks
    // before there is a live one to be killed by.
    async function liveMonster() {
        let monster = harness.findMonster();
        for (let attempt = 0; attempt < 20 && !monster?.getPoint(PointsEnum.HEALTH); attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            monster = harness.findMonster();
        }

        expect(monster, 'setup: the world spawned a monster').to.not.equal(undefined);
        expect(monster!.getPoint(PointsEnum.HEALTH), 'setup: the monster is alive').to.be.greaterThan(0);
        return monster!;
    }

    it('brings the character back to life on /restart_here', async () => {
        const monster = await liveMonster();

        restarter = await harness.login({
            username: RESTARTER,
            x: monster.getPositionX(),
            y: monster.getPositionY(),
        });

        const player = harness.findPlayer(RESTARTER);
        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        player.takeDamage(monster, player.getPoint(PointsEnum.HEALTH) + 1);
        expect(player.isDead(), 'setup: the character died').to.equal(true);

        restarter.command('/restart_here');
        await restarter.settle(800);

        expect(player.isDead(), 'restart cleared the dead position').to.equal(false);
        expect(player.getPoint(PointsEnum.HEALTH), 'restart left the character with usable health').to.be.greaterThan(
            0,
        );
    });

    it('ignores an attack sent while dead instead of reviving the attacker', async () => {
        const monster = await liveMonster();

        swinger = await harness.login({
            username: SWINGER,
            x: monster.getPositionX(),
            y: monster.getPositionY(),
        });

        const player = harness.findPlayer(SWINGER);
        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        // The damage line is debug output, so it has to be switched on or the
        // assertion below would be vacuously false.
        swinger.command('/debug');
        await swinger.settle(400);

        // Positive control: the same packet lands while alive, so a missing
        // damage message after the death is the dead state rejecting it.
        swinger.flush();
        swinger.attack(monster.getVirtualId());
        await swinger.settle(600);
        expect(swinger.received().includes(DAMAGE_MESSAGE), 'setup: the attack lands while alive').to.equal(true);

        player.takeDamage(monster, player.getPoint(PointsEnum.HEALTH) + 1);
        expect(player.isDead(), 'setup: the character died').to.equal(true);

        swinger.flush();
        swinger.attack(monster.getVirtualId());
        await swinger.settle(600);

        expect(player.isDead(), 'the attack did not clear the dead position').to.equal(true);
        expect(swinger.received().includes(DAMAGE_MESSAGE), 'no damage dealt while dead').to.equal(false);
    });
});
