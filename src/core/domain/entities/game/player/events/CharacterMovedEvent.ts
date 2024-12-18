import GameEntity from '../../GameEntity';
import PlayerEventsEnum from './PlayerEventsEnum';

export default class CharacterMovedEvent {
    public static readonly type = PlayerEventsEnum.CHARACTER_MOVED;
    public readonly entity: GameEntity;
    public readonly params: number;

    constructor({ entity, params }) {
        this.entity = entity;
        this.params = params;
    }
}
