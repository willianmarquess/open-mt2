import PlayerEventsEnum from './PlayerEventsEnum';

export default class ChatEvent {
    public static readonly type = PlayerEventsEnum.CHAT;
    public readonly messageType: number;
    public readonly message: string;

    constructor({ messageType, message = '' }) {
        this.messageType = messageType;
        this.message = message;
    }
}
