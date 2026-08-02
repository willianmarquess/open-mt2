import { expect } from 'chai';
import AttackHarness, { AttackSession } from '../../support/AttackSession';
import { container } from '@/game/Container';

/**
 * Regression for issue #149: the logout save ran on an area tick after the
 * player was already removed from the entity map, unawaited and unobservable,
 * and the /logout countdown despawned twice so it ran twice.
 *
 * The load-bearing assertion is WHERE the save runs, not just that it runs:
 * every repository update for the leaving player must be issued while the
 * player is still in the world (the flush on the logout path), never from the
 * despawn tick after removal. On master both /logout saves happen after
 * removal, so `savesAfterRemoval` reads 2 and the case fails.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Bug — the logout save happens on the logout path (issue #149)', function () {
    this.timeout(60_000);

    const LEAVER = 'logoutflush_test';
    const SEEDED_GOLD = 12038002;
    const GOLD_DELTA = 777;

    let harness: AttackHarness;
    let session: AttackSession;
    let repo: any;
    let originalUpdate: (state: unknown) => Promise<unknown>;
    let savesWhileLive = 0;
    let savesAfterRemoval = 0;

    const db = () => container.resolve('databaseManager') as any;

    const playerRow = async (name: string) => {
        const [rows] = await db().getConnection().query('SELECT gold FROM game.player WHERE name = ?', [name]);
        return rows[0];
    };

    const waitFor = async (predicate: () => boolean | Promise<boolean>, timeoutMs: number, stepMs = 100) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (await predicate()) return true;
            await new Promise((resolve) => setTimeout(resolve, stepMs));
        }
        return false;
    };

    before(async () => {
        harness = await new AttackHarness().start();

        repo = container.resolve('playerRepository');
        originalUpdate = repo.update.bind(repo);
        repo.update = (state: any) => {
            if (state?.name === LEAVER) {
                if (harness.findPlayer(LEAVER)) savesWhileLive++;
                else savesAfterRemoval++;
            }
            return originalUpdate(state);
        };
    });

    after(async () => {
        repo.update = originalUpdate;
        // The /logout case leaves the socket already closed server-side, and
        // AttackSession.close has no idempotency guard.
        await Promise.race([session?.close(), new Promise((resolve) => setTimeout(resolve, 1_000))]);
        await harness?.stop();
    });

    it('saves the leaving player exactly once, before removal from the world, and the data lands', async () => {
        session = await harness.login({ username: LEAVER });
        await session.settle(600);
        expect(harness.findPlayer(LEAVER), 'setup: the player entered the world').to.not.equal(undefined);

        session.command(`/gold ${GOLD_DELTA}`);
        await session.settle(400);
        expect((await playerRow(LEAVER)).gold, 'setup: nothing persisted the gold yet').to.equal(SEEDED_GOLD);

        savesWhileLive = 0;
        savesAfterRemoval = 0;

        session.command('/logout');
        const left = await waitFor(() => harness.findPlayer(LEAVER) === undefined, 20_000, 250);
        expect(left, 'the countdown ran out and the player left the world').to.equal(true);

        // Let any straggler despawn tick run before judging.
        await new Promise((resolve) => setTimeout(resolve, 1_000));

        expect(savesAfterRemoval, 'no save may run after the player left the world').to.equal(0);
        expect(savesWhileLive, 'the logout path itself saved the player').to.be.greaterThanOrEqual(1);
        expect((await playerRow(LEAVER)).gold, 'the flushed save carried the data').to.equal(SEEDED_GOLD + GOLD_DELTA);
    });
});
