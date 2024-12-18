import Item from "@/core/domain/entities/game/item/Item";

export default class DroppedItem {
    private item: Item;
    private count: number;
    private ownerName: string;
    private virtualId: number;
    private positionX: number;
    private positionY: number;

    constructor({ item, count, ownerName, virtualId, positionX, positionY }) {
        this.item = item;
        this.count = count;
        this.ownerName = ownerName;
        this.virtualId = virtualId;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    getItem() {
        return this.item;
    }
    getCount() {
        return this.count;
    }
    getOwnerName() {
        return this.ownerName;
    }
    getVirtualId() {
        return this.virtualId;
    }
    getPositionX() {
        return this.positionX;
    }
    getPositionY() {
        return this.positionY;
    }

    static create({ item, count, ownerName, virtualId, positionX, positionY }) {
        return new DroppedItem({
            item,
            count,
            ownerName,
            virtualId,
            positionX,
            positionY,
        });
    }
}
