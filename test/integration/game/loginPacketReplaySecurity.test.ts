import { expect } from 'chai';
import { container } from '@/game/Container';
import BufferWriter from '@/core/interface/networking/buffer/BufferWriter';
import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for issue #123: ENTER_GAME and SELECT_CHARACTER belong to the login
 * phase. Replaying them from inside the game re-runs onSpawn (a free full heal,
 * renewable mob immunity, a quest reset) and builds a second live Player for the
 * same database row.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Security — login packets replayed from inside the game (issue #123)', function () {
    this.timeout(60000);

    const HEALED = 'replay_heal_test';
    const DOUBLED = 'replay_select_test';

    let harness: AttackHarness;
    let healSession: AttackSession;
    let selectSession: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await healSession?.close();
        await selectSession?.close();
        await harness?.stop();
    });

    // Spawns are queued to the next area tick, so the entity is not in the world
    // yet when login() resolves.
    async function livePlayer(name: string) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const player = harness.findPlayer(name);
            if (player) return player;
            await new Promise((resolve) => setTimeout(resolve, 250));
        }
        return undefined;
    }

    const livePlayerCount = (name: string) =>
        [...container.resolve<any>('entityManager').entities.values()].filter(
            (entity: any) => entity?.getName?.() === name,
        ).length;

    it('should not let a replayed ENTER_GAME heal the character', async () => {
        healSession = await harness.login({ username: HEALED });
        const player = await livePlayer(HEALED);

        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        player.addPoint(PointsEnum.HEALTH, -5_000);
        const damaged = player.getPoint(PointsEnum.HEALTH);

        expect(damaged, 'setup: the character is hurt').to.be.lessThan(player.getPoint(PointsEnum.MAX_HEALTH));

        healSession.sendSequenced(new BufferWriter(PacketHeaderEnum.ENTER_GAME, 1).getBuffer());
        await healSession.settle(800);

        expect(player.getPoint(PointsEnum.HEALTH), 'the replay did not refill the health bar').to.be.lessThan(
            player.getPoint(PointsEnum.MAX_HEALTH),
        );
        expect(await harness.isServerAlive(), 'the server stayed up').to.equal(true);
    });

    it('should not let a replayed SELECT_CHARACTER put a second character in the world', async () => {
        selectSession = await harness.login({ username: DOUBLED });
        const player = await livePlayer(DOUBLED);

        expect(player, 'setup: the character reached the world').to.not.equal(undefined);
        expect(livePlayerCount(DOUBLED), 'setup: exactly one live character').to.equal(1);

        selectSession.sendSequenced(new BufferWriter(PacketHeaderEnum.SELECT_CHARACTER, 2).writeUint8(0).getBuffer());
        await selectSession.settle(600);
        selectSession.sendSequenced(new BufferWriter(PacketHeaderEnum.ENTER_GAME, 1).getBuffer());
        await selectSession.settle(800);

        expect(livePlayerCount(DOUBLED), 'still exactly one live character').to.equal(1);
    });
});
