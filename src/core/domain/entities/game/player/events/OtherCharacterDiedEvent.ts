import PlayerEventsEnum from './PlayerEventsEnum';

export default class OtherCharacterDiedEvent {
    public static readonly type = PlayerEventsEnum.OTHER_CHARACTER_DIED;
    public readonly virtualId: number;

    constructor({ virtualId }) {
        this.virtualId = virtualId;
    }
}
