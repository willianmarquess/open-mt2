export default class CacheKeyGenerator {
    static createTokenKey(key: string) {
        return `token:${key}`;
    }

    static createEmpireKey(accountId: number) {
        return `game:empire:${accountId}`;
    }

    static createItemUpdateKey(ownerId: number, itemId: number) {
        return `player:${ownerId}:update:item:${itemId}`;
    }

    static createItemDeleteKey(ownerId: number, itemId: number) {
        return `player:${ownerId}:delete:item:${itemId}`;
    }
}
