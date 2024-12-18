import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterSpawnedEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_SPAWNED;
    public readonly virtualId: number;
    public readonly playerClass: number;
    public readonly entityType: number;
    public readonly attackSpeed: number;
    public readonly movementSpeed: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly empireId: number;
    public readonly level: number;
    public readonly name: string;
    public readonly rotation: number;

    constructor({
        virtualId,
        playerClass,
        entityType,
        attackSpeed,
        movementSpeed,
        positionX,
        positionY,
        empireId,
        level,
        name,
        rotation,
    }) {
        this.virtualId = virtualId;
        this.playerClass = playerClass;
        this.entityType = entityType;
        this.attackSpeed = attackSpeed;
        this.movementSpeed = movementSpeed;
        this.positionX = positionX;
        this.positionY = positionY;
        this.empireId = empireId;
        this.level = level;
        this.name = name;
        this.rotation = rotation;
    }
}
