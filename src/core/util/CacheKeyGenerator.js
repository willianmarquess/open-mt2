export default class CacheKeyGenerator {
    static createTokenKey(key) {
        return `token:${key}`;
    }

    static createEmpireKey(accountId) {
        return `game:empire:${accountId}`;
    }
}
