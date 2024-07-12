export default class CacheKeyGenerator {
    static createTokenKey(key) {
        return `token:${key}`;
    }

    static createEmpireKey(accountId) {
        return `game:empire:${accountId}`;
    }

    static createItemUpdateKey(ownerId, itemId) {
        return `player:${ownerId}:update:item:${itemId}`;
    }

    static createItemDeleteKey(ownerId, itemId) {
        return `player:${ownerId}:delete:item:${itemId}`;
    }
}
