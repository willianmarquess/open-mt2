export default class CharacterUpdatedEvent {
    public readonly vid: number;
    public readonly attackSpeed: number;
    public readonly moveSpeed: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly name: string;
    public readonly bodyId: number;
    public readonly weaponId: number;
    public readonly hairId: number;
    public readonly affects: number[];

    constructor({
        vid,
        attackSpeed,
        moveSpeed,
        positionX,
        positionY,
        name,
        bodyId,
        weaponId,
        hairId,
        affects = new Array(2).fill(0),
    }) {
        this.vid = vid;
        this.attackSpeed = attackSpeed;
        this.moveSpeed = moveSpeed;
        this.positionX = positionX;
        this.positionY = positionY;
        this.name = name;
        this.weaponId = weaponId;
        this.bodyId = bodyId;
        this.hairId = hairId;
        this.affects = affects;
    }
}
