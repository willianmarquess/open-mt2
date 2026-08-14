import { expect } from 'chai';
import sinon from 'sinon';
import AuthenticateService from '@/game/domain/service/AuthenticateService';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

/**
 * The token contract after the two-connection regression: the stock client
 * authenticates once on the connection that lists the characters and again on
 * the fresh connection it opens to enter the world, so a key must stay
 * redeemable for its whole (60s) lifetime. Single-use redemption (GETDEL,
 * issue #104) disconnected every stock client at world entry.
 */
describe('AuthenticateService token redemption', () => {
    const KEY = 0x0badf00d;
    const USERNAME = 'tester';
    const CACHE_KEY = `token:${KEY}`;

    let logger: any;
    let cacheProvider: any;
    let service: AuthenticateService;

    /**
     * A working cache, not a stub: take() removes what it returns (Redis
     * GETDEL) while get()/exists() leave the entry alone. Implementing all
     * three keeps the assertions behavioural — against GETDEL-based code the
     * reuse case fails because the token is gone, not because a method is
     * missing.
     */
    const workingCache = (entries: Record<string, string>) => ({
        take: sinon.stub().callsFake(async (key: string) => {
            const value = entries[key] ?? null;
            delete entries[key];
            return value;
        }),
        get: sinon.stub().callsFake(async (key: string) => entries[key] ?? null),
        exists: sinon.stub().callsFake(async (key: string) => key in entries),
        persist: sinon.stub().resolves(),
    });

    beforeEach(() => {
        logger = { info: sinon.spy(), error: sinon.spy(), debug: sinon.spy() };
        cacheProvider = workingCache({
            [CACHE_KEY]: JSON.stringify({ username: USERNAME, accountId: 7 }),
        });
        service = new AuthenticateService({ logger, cacheProvider });
    });

    it('should authenticate a valid key', async () => {
        const result = await service.execute(KEY, USERNAME);

        expect(result.isOk()).to.equal(true);
        expect(result.getData()).to.deep.equal({ username: USERNAME, accountId: 7 });
    });

    it('should authenticate the same key again for the world connection', async () => {
        await service.execute(KEY, USERNAME);

        const secondConnection = await service.execute(KEY, USERNAME);

        expect(secondConnection.isOk(), 'the stock client redeems the key once per connection').to.equal(true);
        expect(secondConnection.getData()).to.deep.equal({ username: USERNAME, accountId: 7 });
    });

    it('should reject an unknown token', async () => {
        const result = await service.execute(0x11111111, USERNAME);

        expect(result.hasError()).to.equal(true);
        expect(result.getError()).to.equal(ErrorTypesEnum.INVALID_TOKEN);
    });

    it('should reject a username that does not match the key without burning it', async () => {
        const mismatch = await service.execute(KEY, 'someone-else');
        expect(mismatch.hasError()).to.equal(true);
        expect(mismatch.getError()).to.equal(ErrorTypesEnum.INVALID_TOKEN);

        const rightful = await service.execute(KEY, USERNAME);
        expect(rightful.isOk(), 'the rightful owner still logs in after a wrong guess').to.equal(true);
    });
});
