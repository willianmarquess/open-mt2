export default class TokenKeyGenerator {
    static createTokenKey(key) {
        return `token:${key}`;
    }

    static createEmpireKey(accountId) {
        return `game:empire:${accountId}`;
    }
}
