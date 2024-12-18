import PlayerEventsEnum from './PlayerEventsEnum';

export default class ItemDroppedEvent {
    public static readonly type = PlayerEventsEnum.ITEM_DROPPED;
    public readonly virtualId: number;
    public readonly count: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly ownerName: string;
    public readonly id: number;

    constructor({ virtualId, count, positionX, positionY, ownerName, id }) {
        this.virtualId = virtualId;
        this.count = count;
        this.positionX = positionX;
        this.positionY = positionY;
        this.ownerName = ownerName;
        this.id = id;
    }
}
