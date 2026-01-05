import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import Area from '../../Area';
import { SpatialCell } from '@/core/util/SpatialGrid';

export default abstract class GameEntity {
    protected virtualId: number;
    protected entityType: EntityTypeEnum;
    protected positionX: number = 0;
    protected positionY: number = 0;
    protected nearbyEntities = new Map<number, GameEntity>();
    protected area: Area;
    protected cell: SpatialCell;
    protected targetPositionX: number = 0;
    protected targetPositionY: number = 0;

    constructor({ virtualId, entityType, positionX, positionY }) {
        this.virtualId = virtualId;
        this.entityType = entityType;
        this.targetPositionX = this.positionX = positionX;
        this.targetPositionY = this.positionY = positionY;
    }

    setArea(area: Area) {
        this.area = area;
    }

    getVirtualId() {
        return this.virtualId;
    }
    setVirtualId(value: number) {
        this.virtualId = value;
    }
    getEntityType() {
        return this.entityType;
    }
    getPositionX() {
        return this.positionX;
    }
    setPositionX(value: number) {
        this.positionX = value;
    }
    getPositionY() {
        return this.positionY;
    }
    setPositionY(value: number) {
        this.positionY = value;
    }

    addNearbyEntity(entity: GameEntity) {
        if (entity instanceof GameEntity) {
            this.nearbyEntities.set(entity.getVirtualId(), entity as GameEntity);
        }
    }

    removeNearbyEntity(entity: GameEntity) {
        if (entity instanceof GameEntity) {
            this.nearbyEntities.delete(entity.getVirtualId());
        }
    }

    isNearby(entity: GameEntity) {
        if (entity instanceof GameEntity) {
            return this.nearbyEntities.has(entity.getVirtualId());
        }
    }

    getNearbyEntities() {
        return this.nearbyEntities;
    }

    getTargetPosition() {
        return {
            x: this.targetPositionX || this.positionX,
            y: this.targetPositionY || this.positionY,
        };
    }

    setCell(newCell: SpatialCell) {
        this.cell = newCell;
    }

    getCell() {
        return this.cell;
    }
}
