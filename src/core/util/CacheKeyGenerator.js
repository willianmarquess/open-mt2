export default class TokenKeyGenerator {
    static createTokenKey(key) {
        return `token:${key}`;
    }
}
