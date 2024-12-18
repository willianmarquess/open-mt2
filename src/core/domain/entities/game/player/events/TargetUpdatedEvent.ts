import PlayerEventsEnum from './PlayerEventsEnum';

export default class TargetUpdatedEvent {
    public static readonly type = PlayerEventsEnum.TARGET_UPDATED;
    public readonly virtualId: number;
    public readonly healthPercentage: number;

    constructor({ virtualId, healthPercentage }) {
        this.virtualId = virtualId;
        this.healthPercentage = healthPercentage;
    }
}
