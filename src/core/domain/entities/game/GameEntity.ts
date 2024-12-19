export default abstract class GameEntity {
    protected virtualId: number;
    protected entityType: number;
    protected positionX: number = 0;
    protected positionY: number = 0;
    protected nearbyEntities = new Map<number, GameEntity>();

    constructor({ virtualId, entityType, positionX, positionY }) {
        this.virtualId = virtualId;
        this.entityType = entityType;
        this.positionX = positionX;
        this.positionY = positionY;
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

    isNearby(entity: any) {
        if (entity instanceof GameEntity) {
            return this.nearbyEntities.has(entity.getVirtualId());
        }
    }

    getNearbyEntities() {
        return this.nearbyEntities;
    }
}
