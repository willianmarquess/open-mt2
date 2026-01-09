import Item from '@/core/domain/entities/game/item/Item';
import GameEntity from '../GameEntity';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import Player from '../player/Player';

const REMOVE_ITEM_FROM_GROUND = 30000;
const REMOVE_OWNER_ITEM_FROM_GROUND = 15000;

export default class DroppedItem extends GameEntity {
    private readonly item: Item;
    private readonly count: number;
    private ownerName: string;

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

    public onSpawn() {
        this.eventTimerManager.addTimer({
            eventFunction: () => {
                for (const entity of this.getNearbyEntities().values()) {
                    if (entity instanceof Player) {
                        this.ownerName = undefined;
                        entity.sendSetItemOwnership({
                            ownerName: '\0',
                            virtualId: this.getVirtualId(),
                        });
                    }
                }
            },
            options: {
                interval: REMOVE_OWNER_ITEM_FROM_GROUND,
                duration: REMOVE_OWNER_ITEM_FROM_GROUND,
                repeatCount: 1,
            },
            id: `REMOVE_OWNER`,
        });
        this.eventTimerManager.addTimer({
            eventFunction: () => {
                this.area.despawn(this);
            },
            options: {
                interval: REMOVE_ITEM_FROM_GROUND,
                duration: REMOVE_ITEM_FROM_GROUND,
                repeatCount: 1,
            },
            id: `DESPAWN`,
        });
    }

    public onDespawn() {
        this.eventTimerManager.clearAllTimers();
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
