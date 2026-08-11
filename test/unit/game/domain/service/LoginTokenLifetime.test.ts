import { expect } from 'chai';
import sinon from 'sinon';
import AuthenticateService from '@/game/domain/service/AuthenticateService';
import LoginService from '@/auth/app/service/LoginService';
import CacheKeyGenerator from '@/core/util/CacheKeyGenerator';

/**
 * A fake Redis that models what matters here: a value plus whether it carries
 * a TTL. `ttl === null` means the key is persistent, mirroring the original's
 * CLoginKey with m_dwExpireTime == 0 (never reaped while its owner lives).
 */
class FakeCache {
    private readonly values = new Map<string, string>();
    private readonly ttls = new Map<string, number | null>();

    async set(key: string, value: string, expirationInSec?: number) {
        this.values.set(key, value);
        this.ttls.set(key, expirationInSec ?? null);
    }

    async get<T>(key: string) {
        return (this.values.get(key) ?? null) as T;
    }

    async expire(key: string, expirationInSec: number) {
        if (this.values.has(key)) this.ttls.set(key, expirationInSec);
    }

    async persist(key: string) {
        if (this.values.has(key)) this.ttls.set(key, null);
    }

    ttlOf(key: string) {
        return this.ttls.get(key);
    }

    /** Simulates the countdown running out. */
    lapse(key: string) {
        const ttl = this.ttls.get(key);
        if (ttl !== null && ttl !== undefined) {
            this.values.delete(key);
            this.ttls.delete(key);
        }
    }
}

describe('login token lifetime (issue #237)', () => {
    const KEY = 4242;
    const cacheKey = CacheKeyGenerator.createTokenKey(String(KEY));
    const record = JSON.stringify({ username: 'admin', accountId: 1 });

    let cache: FakeCache;
    let authenticate: AuthenticateService;

    beforeEach(async () => {
        cache = new FakeCache();
        authenticate = new AuthenticateService({
            logger: { info: sinon.stub(), error: sinon.stub() },
            cacheProvider: cache,
        } as never);

        // What LoginService now does: mint the key with no expiry at all.
        await cache.set(cacheKey, record);
    });

    it('mints the key without an expiry, so a live session cannot outlive it', async () => {
        const minted = new FakeCache();
        const login = new LoginService({
            logger: { info: sinon.stub(), error: sinon.stub() },
            cacheProvider: minted,
            encryptionProvider: { compare: async () => true },
            accountRepository: {
                findByUsername: async () => ({
                    id: 1,
                    getPassword: () => 'hashed',
                    getAccountStatus: () => ({
                        getAllowLogin: () => true,
                        getClientStatus: () => 'OK',
                    }),
                }),
            },
        } as never);

        const result = await login.execute({ username: 'admin', password: 'pw' });
        const mintedKey = CacheKeyGenerator.createTokenKey(String(result.getData()));

        expect(result.hasError(), 'login succeeded').to.equal(false);
        expect(await minted.get(mintedKey), 'the record is stored').to.be.a('string');
        expect(minted.ttlOf(mintedKey), 'no countdown on a fresh key').to.equal(null);
    });

    it('clears a pending grace period when the key is redeemed again', async () => {
        await cache.expire(cacheKey, 60);
        expect(cache.ttlOf(cacheKey), 'grace armed by a closing connection').to.equal(60);

        const result = await authenticate.execute(KEY, 'admin');

        expect(result.hasError(), 'the redemption still succeeds').to.equal(false);
        expect(cache.ttlOf(cacheKey), 'and the countdown is cleared for the new session').to.equal(null);
    });

    it('survives the stock client handover: select connection closes, world connection authenticates', async () => {
        // Connection A - the character-list connection.
        expect((await authenticate.execute(KEY, 'admin')).hasError()).to.equal(false);

        // A closes; the account has no live connection, so the grace starts.
        await cache.expire(cacheKey, 60);

        // Connection B - the world connection, same cached key.
        const b = await authenticate.execute(KEY, 'admin');

        expect(b.hasError(), 'the world connection must authenticate').to.equal(false);
        expect(cache.ttlOf(cacheKey), 'and the key stops counting down while B lives').to.equal(null);

        // The player now plays far longer than the old 60s window.
        cache.lapse(cacheKey);

        const later = await authenticate.execute(KEY, 'admin');
        expect(later.hasError(), 'a later re-auth (phase_select) still works').to.equal(false);
    });

    it('lets the key die once a grace period is left running', async () => {
        await cache.expire(cacheKey, 60);
        cache.lapse(cacheKey);

        const result = await authenticate.execute(KEY, 'admin');

        expect(result.hasError(), 'an abandoned key is gone after the grace').to.equal(true);
    });

    it('still refuses a key whose username does not match', async () => {
        const result = await authenticate.execute(KEY, 'someone-else');

        expect(result.hasError()).to.equal(true);
    });
});
