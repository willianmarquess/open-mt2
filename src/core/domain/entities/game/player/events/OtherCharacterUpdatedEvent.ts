import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterUpdatedEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_UPDATED;
    public readonly vid: number;
    public readonly attackSpeed: number;
    public readonly moveSpeed: number;
    public readonly bodyId: number;
    public readonly weaponId: number;
    public readonly hairId: number;

    constructor({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId }) {
        this.vid = vid;
        this.attackSpeed = attackSpeed;
        this.moveSpeed = moveSpeed;
        this.weaponId = weaponId;
        this.bodyId = bodyId;
        this.hairId = hairId;
    }
}
