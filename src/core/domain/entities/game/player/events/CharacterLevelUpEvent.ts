import Character from '../../Character';
import PlayerEventsEnum from './PlayerEventsEnum';

export default class CharacterLevelUpEvent {
    public static readonly type = PlayerEventsEnum.CHARACTER_LEVEL_UP;
    public readonly entity: Character;

    constructor({ entity }) {
        this.entity = entity;
    }
}
