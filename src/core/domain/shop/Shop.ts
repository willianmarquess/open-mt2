import Grid from '@/core/util/Grid';
import { ShopItem } from './ShopItem';

export const SHOP_MAX_ITEMS = 40;
export const SHOP_GRID_WIDTH = 5;
export const SHOP_GRID_HEIGHT = 8;

export default class Shop {
    private readonly npcVnum: number;
    private readonly shopName: string;
    private readonly items: Array<ShopItem | undefined>;
    private readonly grid: Grid<ShopItem | undefined>;

    constructor({ npcVnum, shopName, items }: { npcVnum: number; shopName: string; items: ShopItem[] }) {
        this.npcVnum = npcVnum;
        this.shopName = shopName;
        this.items = new Array(SHOP_MAX_ITEMS).fill(undefined);
        this.grid = new Grid<ShopItem | undefined>(SHOP_GRID_WIDTH, SHOP_GRID_HEIGHT, undefined);

        items.slice(0, SHOP_MAX_ITEMS).forEach((shopItem) => {
            const position = this.addItem(shopItem);

            if (position === -1) {
                return;
            }

            shopItem.position = position;
            this.items[position] = shopItem;
        });
    }

    getItems() {
        return this.items;
    }

    getNpcVnum() {
        return this.npcVnum;
    }

    getShopName() {
        return this.shopName;
    }

    addItem(item: ShopItem) {
        for (let y = 0; y < this.grid.getHeight(); y++) {
            for (let x = 0; x < this.grid.getWidth(); x++) {
                if (this.haveSpaceAvailable(x, y, item.size)) {
                    for (let i = 0; i < item.size; i++) {
                        this.grid.setValue(x, y + i, item);
                    }
                    return x + y * this.grid.getWidth();
                }
            }
        }

        return -1;
    }

    haveSpaceAvailable(x: number, y: number, size: number) {
        for (let i = 0; i < size; i++) {
            if (y + i >= this.grid.getHeight()) return false;

            if (this.grid.getValue(x, y + i)) {
                return false;
            }
        }

        return true;
    }

    calcPosition(position: number) {
        const x = Math.floor(position % this.grid.getWidth());
        const y = Math.floor(position / this.grid.getWidth());

        return {
            x,
            y,
        };
    }

    haveAvailablePosition(position: number, size: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return false;

        const { x, y } = this.calcPosition(position);

        return this.haveSpaceAvailable(x, y, size);
    }

    getItem(position: number) {
        if (position < 0 || position >= this.grid.getWidth() * this.grid.getHeight()) return;

        const { x, y } = this.calcPosition(position);

        return this.grid.getValue(x, y);
    }

    printGrid() {
        for (let y = 0; y < this.grid.getHeight(); y++) {
            const row: number[] = [];
            for (let x = 0; x < this.grid.getWidth(); x++) {
                row.push(this.grid.getValue(x, y)?.position || 0);
            }
            console.log(row.join(' '));
        }
    }
}
