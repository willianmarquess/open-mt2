import GameEntity from '../../GameEntity';
import PlayerEventsEnum from './PlayerEventsEnum';

export default class CharacterLevelUpEvent {
    public static readonly type = PlayerEventsEnum.CHARACTER_LEVEL_UP;
    public readonly entity: GameEntity;

    constructor({ entity }) {
        this.entity = entity;
    }
}
