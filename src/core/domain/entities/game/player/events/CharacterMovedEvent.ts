import GameEntity from '../../GameEntity';
import PlayerEventsEnum from './PlayerEventsEnum';

export default class CharacterMovedEvent {
    public static readonly type = PlayerEventsEnum.CHARACTER_MOVED;
    public readonly entity: GameEntity;
    public readonly params: {
        positionX: number;
        positionY: number;
        arg: number;
        rotation: number;
        time: number;
        movementType: number;
        duration: number;
    };

    constructor({ entity, params }) {
        this.entity = entity;
        this.params = params;
    }
}
