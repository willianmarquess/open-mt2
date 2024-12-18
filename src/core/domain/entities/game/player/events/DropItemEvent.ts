import Item from '../../item/Item';
import PlayerEventsEnum from './PlayerEventsEnum';

export default class DropItemEvent {
    public static readonly type = PlayerEventsEnum.DROP_ITEM;

    public readonly item: Item;
    public readonly count: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly ownerName: number;

    constructor({ item, count, positionX, positionY, ownerName }) {
        this.item = item;
        this.count = count;
        this.positionX = positionX;
        this.positionY = positionY;
        this.ownerName = ownerName;
    }
}
