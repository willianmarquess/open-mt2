import { expect } from 'chai';
import { container } from '@/game/Container';
import AttackHarness, { AttackSession } from '../../support/AttackSession';

/**
 * Regression for the stock client's login flow: it authenticates TWICE with the
 * same login key — once on the connection that lists the characters, and once
 * on the fresh connection it opens to enter the world with the ip/port from
 * CharactersInfoPacket. Single-use token redemption (GETDEL) made the second
 * authentication find nothing, so every stock client reached character
 * selection and was then disconnected on entering the world.
 *
 * The harness logs in over a single connection, which is why the suites never
 * saw it; this spec closes the first session and walks the whole enter-game
 * flow a second time on a new socket with the same key, exactly like the real
 * client does.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Auth token across the stock client’s two connections', function () {
    this.timeout(60000);

    const USERNAME = 'two_conn_login';
    const HARNESS_KEY = 0x0badf00d;

    let harness: AttackHarness;
    let selectPhase: AttackSession;
    let worldPhase: AttackSession;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await selectPhase?.close();
        await worldPhase?.close();
        await harness?.stop();
    });

    it('should let the same key authenticate the select connection and the world connection', async () => {
        // First connection: seeds the account, injects the key, authenticates
        // and enters the world — the harness's normal login.
        selectPhase = await harness.login({ username: USERNAME });

        // The stock client closes the select-phase connection before it dials
        // the world; without this, #189's single-session rule would refuse the
        // second connection for a different reason than the one under test.
        await selectPhase.close();
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Second connection, same key: handshake, TOKEN, character list,
        // select, enter game. With single-use redemption this dies at the
        // TOKEN step because the key was consumed by the first connection.
        const config = container.resolve<any>('config');
        worldPhase = new AttackSession(config.SERVER_ADDRESS, Number(config.SERVER_PORT), harness['db']);

        await worldPhase.enterGame(USERNAME, HARNESS_KEY);

        const player = harness.findPlayer(USERNAME);
        expect(player, 'the world connection authenticated with the same key').to.not.equal(undefined);
    });
});
