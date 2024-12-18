import PlayerEventsEnum from './PlayerEventsEnum';

export default class ItemAddedEvent {
    public static readonly type = PlayerEventsEnum.ITEM_ADDED;
    public readonly window: number;
    public readonly position: number;
    public readonly id: number;
    public readonly count: number;
    public readonly flags: number;
    public readonly antiFlags: number;
    public readonly highlight: number;
    public readonly sockets: number;
    public readonly bonuses: number;

    constructor({ window, position, id, count, flags, antiFlags, highlight, sockets, bonuses }) {
        this.window = window;
        this.position = position;
        this.id = id;
        this.count = count;
        this.flags = flags;
        this.antiFlags = antiFlags;
        this.highlight = highlight;
        this.sockets = sockets;
        this.bonuses = bonuses;
    }
}
