import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterMovedEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_MOVED;
    public readonly virtualId: number;
    public readonly arg: number;
    public readonly movementType: number;
    public readonly time: number;
    public readonly rotation: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly duration: number;

    constructor({ virtualId, arg, movementType, time, rotation, positionX, positionY, duration }) {
        this.virtualId = virtualId;
        this.arg = arg;
        this.movementType = movementType;
        this.time = time;
        this.rotation = rotation;
        this.positionX = positionX;
        this.positionY = positionY;
        this.duration = duration;
    }
}
