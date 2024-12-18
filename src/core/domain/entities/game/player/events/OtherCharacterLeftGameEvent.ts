import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterLeftGameEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_LEFT_GAME;
    public readonly virtualId: number;

    constructor({ virtualId }) {
        this.virtualId = virtualId;
    }
}
