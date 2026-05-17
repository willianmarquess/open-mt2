import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';

export const PRIVATE_SHOP_MAX_ITEMS = 40;
export const PRIVATE_SHOP_SIGN_MAX_LEN = 32;

export type PrivateShopItem = {
    /** Display slot in the shop grid (0-based, sent by client as displayPos). */
    displayPos: number;
    /** Inventory slot the item occupies on the shop owner. */
    inventoryPos: number;
    /** Price the buyer must pay (in gold). */
    price: number;
    /** Reference to the actual item - stays in the owner's inventory but is locked. */
    item: Item;
};

/**
 * Represents a player-owned private shop.
 *
 * Items remain in the owner's inventory but are flagged as "selling".
 * The shop holds a guest-list of players currently browsing; they each receive
 * UPDATE_ITEM / END packets when the shop state changes.
 */
export default class PrivateShop {
    private readonly owner: Player;
    private readonly sign: string;
    /** Keyed by displayPos (shop grid slot 0-39). */
    private readonly items: Map<number, PrivateShopItem> = new Map();
    private readonly guests: Set<Player> = new Set();

    constructor({ owner, sign, items }: { owner: Player; sign: string; items: PrivateShopItem[] }) {
        this.owner = owner;
        this.sign = sign.slice(0, PRIVATE_SHOP_SIGN_MAX_LEN);

        for (const entry of items.slice(0, PRIVATE_SHOP_MAX_ITEMS)) {
            this.items.set(entry.displayPos, entry);
        }
    }

    getOwner(): Player {
        return this.owner;
    }

    getSign(): string {
        return this.sign;
    }

    /**
     * Returns a 40-slot sparse array indexed by displayPos.
     * Empty slots are undefined.
     */
    getItemsAsArray(): (PrivateShopItem | undefined)[] {
        const result: (PrivateShopItem | undefined)[] = new Array(PRIVATE_SHOP_MAX_ITEMS).fill(undefined);
        for (const [displayPos, entry] of this.items) {
            result[displayPos] = entry;
        }
        return result;
    }

    getItemAtDisplaySlot(displaySlot: number): PrivateShopItem | undefined {
        return this.items.get(displaySlot);
    }

    /**
     * Removes an item from the shop after it has been sold.
     * Returns true when the slot was occupied.
     */
    removeItemAtDisplaySlot(displaySlot: number): boolean {
        return this.items.delete(displaySlot);
    }

    isEmpty(): boolean {
        return this.items.size === 0;
    }

    addGuest(player: Player): void {
        this.guests.add(player);
    }

    removeGuest(player: Player): void {
        this.guests.delete(player);
    }

    getGuests(): Set<Player> {
        return this.guests;
    }

    hasGuest(player: Player): boolean {
        return this.guests.has(player);
    }
}
