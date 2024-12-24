import PlayerEventsEnum from './PlayerEventsEnum';

export default class ItemDroppedHideEvent {
    public static readonly type = PlayerEventsEnum.ITEM_DROPPED_HIDE;
    public readonly virtualId: number;

    constructor({ virtualId }) {
        this.virtualId = virtualId;
    }
}
