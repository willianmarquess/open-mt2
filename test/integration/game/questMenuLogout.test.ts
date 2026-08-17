import { expect } from 'chai';
import { container } from '@/game/Container';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for issue #120: an NPC chat menu that the player never answers is
 * recorded against the persistent character id, so without a logout hook it
 * survives the disconnect and diverts the next session's first quest answer.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Quest chat menu left open at disconnect (issue #120)', function () {
    this.timeout(60000);

    const USERNAME = 'quest_menu_test';
    const HORSE_TRAINER_NPC_VNUM = 20349;
    const CLOSE_WINDOW_ANSWER = 254;

    let harness: AttackHarness;
    let session: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await session?.close();
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

    it('drops the menu when the connection goes away', async () => {
        const questManager = container.resolve<any>('questManager');
        const pendingChatOptions = questManager.pendingChatOptions;

        session = await harness.login({ username: USERNAME });
        const player = await livePlayer(USERNAME);

        expect(player, 'setup: the character reached the world').to.not.equal(undefined);

        // The welcome quest suspends on login and blocks every NPC interaction
        // until the player closes it: first the [NEXT] page, then the select.
        questManager.onAnswer(player, CLOSE_WINDOW_ANSWER);
        await session.settle(200);
        questManager.onAnswer(player, CLOSE_WINDOW_ANSWER);
        await session.settle(200);

        expect(player.isQuestRunning(), 'setup: no quest is holding the player anymore').to.equal(false);

        const opened = await questManager.onClick(player, {
            isNPC: () => true,
            getId: () => HORSE_TRAINER_NPC_VNUM,
        });

        expect(opened, 'setup: the horse trainer chat menu opened').to.equal(true);
        expect(pendingChatOptions.has(player.getId()), 'setup: the open menu was recorded').to.equal(true);

        await session.close();

        for (let attempt = 0; attempt < 20 && pendingChatOptions.has(player.getId()); attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        expect(pendingChatOptions.has(player.getId()), 'the menu did not outlive the connection').to.equal(false);
    });
});
