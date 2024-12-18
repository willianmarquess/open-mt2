import PlayerEventsEnum from './PlayerEventsEnum';

export default class ItemRemovedEvent {
    public static readonly type = PlayerEventsEnum.ITEM_REMOVED;
    public readonly window: number;
    public readonly position: number;

    constructor({ window, position }) {
        this.window = window;
        this.position = position;
    }
}
