import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterLevelUpEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_LEVEL_UP;
    public readonly virtualId: number;
    public readonly level: number;

    constructor({ virtualId, level }) {
        this.virtualId = virtualId;
        this.level = level;
    }
}
