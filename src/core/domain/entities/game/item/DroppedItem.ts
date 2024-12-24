import Item from '@/core/domain/entities/game/item/Item';
import GameEntity from '../GameEntity';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

export default class DroppedItem extends GameEntity {
    private readonly item: Item;
    private readonly count: number;
    private readonly ownerName: string;

    constructor({ item, count, ownerName, virtualId, positionX, positionY }) {
        super({
            virtualId,
            entityType: EntityTypeEnum.DROPPED_ITEM,
            positionX,
            positionY,
        });
        this.item = item;
        this.count = count;
        this.ownerName = ownerName;
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
