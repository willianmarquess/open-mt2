import { expect } from 'chai';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import Monster from '@/core/domain/entities/game/mob/Monster';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Covers issue #50: a RANGE monster must shoot the character it is chasing.
 * Both halves are asserted — the projectile packet the client draws, and the
 * damage that follows it.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Feature — ranged monster attacks (issue #50)', function () {
    this.timeout(60000);

    const TARGET = 'ranged_target_test';
    const BATTLE_BAILIFF = 11101;
    const DAMAGE_MESSAGE = 'Damage received';

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
        await harness?.stop();
    });

    // Taken from the character's own view rather than the whole world, so it is
    // the invoked monster and not one another spec left lying around.
    async function invokedRangedMonster(player: any): Promise<Monster | undefined> {
        for (let attempt = 0; attempt < 40; attempt++) {
            const candidate = [...player.getNearbyEntities().values()].find(
                (entity: any) =>
                    entity instanceof Monster &&
                    entity.getBattleType() === BattleTypeEnum.RANGE &&
                    entity.getPoint(PointsEnum.HEALTH) > 0,
            );

            if (candidate) return candidate as Monster;
            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        return undefined;
    }

    it('shoots the character it is chasing and lands damage', async () => {
        session = await harness.login({ username: TARGET });

        const player = harness.findPlayer(TARGET);
        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        // The damage line is debug output, so it has to be switched on or the
        // assertion below would be vacuously false.
        session.command('/debug');
        await session.settle(400);

        session.command(`/invoke ${BATTLE_BAILIFF}`);
        await session.settle(800);

        const monster = await invokedRangedMonster(player);
        expect(monster, 'setup: a RANGE monster spawned and saw the character').to.not.equal(undefined);

        const healthBefore = player.getPoint(PointsEnum.HEALTH);
        session.flush();

        for (let attempt = 0; attempt < 40 && !session.received().includes(DAMAGE_MESSAGE); attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        expect(session.received().includes(DAMAGE_MESSAGE), 'the ranged monster dealt damage').to.equal(true);
        expect(player.getPoint(PointsEnum.HEALTH), 'the character lost health').to.be.lessThan(healthBefore);

        // The projectile the client draws: header, then shooter and target vid.
        const projectile = Buffer.alloc(9);
        projectile.writeUInt8(PacketHeaderEnum.FLY_TARGETING, 0);
        projectile.writeUInt32LE(monster!.getVirtualId(), 1);
        projectile.writeUInt32LE(player.getVirtualId(), 5);

        expect(session.received().includes(projectile), 'the projectile was broadcast').to.equal(true);
    });
});
