import { expect } from 'chai';
import sinon from 'sinon';
import AuthenticateService from '@/game/domain/service/AuthenticateService';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

/**
 * Regression for issue #104: the login token was looked up with exists() then
 * get(), and never removed, so the same key could be redeemed any number of
 * times for the whole of its lifetime.
 */
describe('AuthenticateService token redemption (issue #104)', () => {
    const KEY = 0x0badf00d;
    const USERNAME = 'tester';
    const CACHE_KEY = `token:${KEY}`;

    let logger: any;
    let cacheProvider: any;
    let service: AuthenticateService;

    /**
     * A working cache, not a stub: take() removes what it returns (Redis
     * GETDEL) while get()/exists() leave the entry alone. Implementing all
     * three is what makes the fail-without-fix signal behavioural — against
     * the old exists()+get() code these cases fail because the token survives,
     * not because a method is missing.
     */
    const workingCache = (entries: Record<string, string>) => ({
        take: sinon.stub().callsFake(async (key: string) => {
            const value = entries[key] ?? null;
            delete entries[key];
            return value;
        }),
        get: sinon.stub().callsFake(async (key: string) => entries[key] ?? null),
        exists: sinon.stub().callsFake(async (key: string) => key in entries),
    });

    beforeEach(() => {
        logger = { info: sinon.spy(), error: sinon.spy(), debug: sinon.spy() };
        cacheProvider = workingCache({
            [CACHE_KEY]: JSON.stringify({ username: USERNAME, accountId: 7 }),
        });
        service = new AuthenticateService({ logger, cacheProvider });
    });

    it('should authenticate the first redemption of a token', async () => {
        const result = await service.execute(KEY, USERNAME);

        expect(result.isOk()).to.equal(true);
        expect(result.getData()).to.deep.equal({ username: USERNAME, accountId: 7 });
    });

    it('should reject the second redemption of the same token', async () => {
        await service.execute(KEY, USERNAME);

        const replay = await service.execute(KEY, USERNAME);

        expect(replay.hasError(), 'a captured key must not be reusable').to.equal(true);
        expect(replay.getError()).to.equal(ErrorTypesEnum.INVALID_TOKEN);
    });

    it('should let exactly one of two concurrent redemptions win', async () => {
        const [first, second] = await Promise.all([service.execute(KEY, USERNAME), service.execute(KEY, USERNAME)]);

        const accepted = [first, second].filter((result) => result.isOk());
        expect(accepted.length, 'the take is atomic, so a race cannot admit both').to.equal(1);
    });

    it('should reject an unknown token', async () => {
        const result = await service.execute(0x11111111, USERNAME);

        expect(result.hasError()).to.equal(true);
        expect(result.getError()).to.equal(ErrorTypesEnum.INVALID_TOKEN);
    });

    it('should burn the token when the username does not match it', async () => {
        const mismatch = await service.execute(KEY, 'someone-else');
        expect(mismatch.hasError()).to.equal(true);

        const retry = await service.execute(KEY, USERNAME);
        expect(retry.hasError(), 'a wrong guess must not leave the key usable').to.equal(true);
    });
});
