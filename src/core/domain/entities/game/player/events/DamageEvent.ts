import PlayerEventsEnum from './PlayerEventsEnum';

export default class DamageEvent {
    public static readonly type = PlayerEventsEnum.DAMAGE_CAUSED;

    public readonly virtualId: number;
    public readonly damage: number;
    public readonly damageFlags: number;

    constructor({ virtualId, damage, damageFlags }) {
        this.virtualId = virtualId;
        this.damage = damage;
        this.damageFlags = damageFlags;
    }
}
