export default class CacheKeyGenerator {
  static createTokenKey(key: number): string {
    return `token:${key}`;
  }

  static createEmpireKey(accountId: number) {
    return `game:empire:${accountId}`;
  }

  static createItemUpdateKey(ownerId: number, itemId: number) {
    return `player:${ownerId}:update:item:${itemId}`;
  }

  static createItemDeleteKey(ownerId, itemId) {
    return `player:${ownerId}:delete:item:${itemId}`;
  }
}
