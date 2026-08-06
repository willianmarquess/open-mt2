import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for issue #107: an aggressive monster must keep scanning its
 * neighbours instead of giving up at the first one it cannot attack. That list
 * only ever holds players, so the blocking entry is a player
 * `isAttackableVictim` rejects — a dead one here.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — aggressive monster victim scan (issue #107)', function () {
    this.timeout(60000);

    const BLOCKER = 'blocker_test';
    const SURVIVOR = 'survivor_test';

    let harness: AttackHarness;
    let blocker: AttackSession;
    let survivor: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await blocker?.close();
        await survivor?.close();
        await harness?.stop();
    });

    // An empty neighbour list keeps the insertion order below predictable, since
    // players from earlier specs would otherwise already be in it.
    async function untouchedAggressiveMonster() {
        for (let attempt = 0; attempt < 20; attempt++) {
            const candidate = harness
                .findMonsters()
                .find(
                    (monster) =>
                        monster.isAggresive() &&
                        monster.getPoint(PointsEnum.HEALTH) > 0 &&
                        monster.getNearbyEntities().size === 0 &&
                        harness.areaAt(monster.getPositionX(), monster.getPositionY()) === monster.getArea(),
                );

            if (candidate) return candidate;
            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        return undefined;
    }

    it('keeps scanning past a player it cannot attack and targets the one behind it', async () => {
        const monster = await untouchedAggressiveMonster();

        expect(monster, 'setup: an aggressive monster with an empty neighbour list spawned').to.not.equal(undefined);

        const x = monster!.getPositionX();
        const y = monster!.getPositionY();

        // Order matters: the blocker has to enter the monster's view first.
        blocker = await harness.login({ username: BLOCKER, x, y });
        await blocker.settle(600);
        survivor = await harness.login({ username: SURVIVOR, x, y });
        await survivor.settle(600);

        const blockerPlayer = harness.findPlayer(BLOCKER);
        const survivorPlayer = harness.findPlayer(SURVIVOR);

        expect(blockerPlayer, 'setup: the blocker reached the world').to.not.equal(undefined);
        expect(survivorPlayer, 'setup: the survivor reached the world').to.not.equal(undefined);

        const neighbours = [...monster!.getNearbyEntities().keys()];
        expect(
            neighbours.indexOf(blockerPlayer.getVirtualId()),
            'setup: the blocker sits ahead of the survivor in the neighbour list',
        ).to.be.lessThan(neighbours.indexOf(survivorPlayer.getVirtualId()));

        blockerPlayer.takeDamage(monster, blockerPlayer.getPoint(PointsEnum.HEALTH) + 1);
        expect(blockerPlayer.isDead(), 'setup: the blocker is dead and so unattackable').to.equal(true);

        monster!.removeTarget();

        for (let attempt = 0; attempt < 40 && !monster!.getTarget(); attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        expect(monster!.getTarget()?.getVirtualId(), 'the monster targeted the living character').to.equal(
            survivorPlayer.getVirtualId(),
        );
    });
});
