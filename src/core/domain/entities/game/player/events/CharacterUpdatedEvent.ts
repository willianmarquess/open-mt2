import PlayerEventsEnum from './PlayerEventsEnum';

export default class CharacterUpdatedEvent {
    public static readonly type = PlayerEventsEnum.CHARACTER_UPDATED;
    public readonly vid: number;
    public readonly attackSpeed: number;
    public readonly moveSpeed: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly name: string;
    public readonly bodyId: number;
    public readonly weaponId: number;
    public readonly hairId: number;

    constructor({ vid, attackSpeed, moveSpeed, positionX, positionY, name, bodyId, weaponId, hairId }) {
        this.vid = vid;
        this.attackSpeed = attackSpeed;
        this.moveSpeed = moveSpeed;
        this.positionX = positionX;
        this.positionY = positionY;
        this.name = name;
        this.weaponId = weaponId;
        this.bodyId = bodyId;
        this.hairId = hairId;
    }
}
