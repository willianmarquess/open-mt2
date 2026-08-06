import { expect } from 'chai';
import AttackHarness from '../../support/AttackSession';

/**
 * Regression for issue #148: World.spawn drops a character whose coordinates no
 * area owns, logging at info level and returning, so the harness used to hand
 * back a session for a character that was never in the world. Specs then
 * asserted against undefined and failed far from the cause - or passed
 * vacuously.
 *
 * Needs MySQL + Redis up (docker) and the game port free (stop `dev:game`).
 */
describe('Harness spawn guard (issue #148)', function () {
    this.timeout(60_000);

    const NOWHERE = { x: 99_000_000, y: 99_000_000 };

    let harness: AttackHarness;

    before(async () => {
        harness = await new AttackHarness().start();
    });

    after(async () => {
        await harness?.stop();
    });

    it('should report the coordinates when a character cannot enter the world', async () => {
        expect(harness.areaAt(NOWHERE.x, NOWHERE.y), 'setup: no area owns these coordinates').to.equal(undefined);

        const failure = await harness
            .login({ username: 'nowhere_test', ...NOWHERE })
            .then(() => undefined)
            .catch((error: Error) => error);

        expect(failure, 'login fails instead of returning a session for a ghost').to.be.instanceOf(Error);
        expect(failure!.message).to.contain('never entered the world');
        expect(failure!.message, 'and names the coordinates that were refused').to.contain(String(NOWHERE.x));
    });

    it('should only offer monsters whose position their own area still owns', async () => {
        const monster = await harness.awaitMonsterInPlace();

        expect(monster, 'setup: at least one monster is standing on its own area').to.not.equal(undefined);
        expect(harness.areaAt(monster!.getPositionX(), monster!.getPositionY())).to.equal(monster!.getArea());
    });
});
