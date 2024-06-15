import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class ChatEvent {
    static #type = PlayerEventsEnum.CHAT;
    #messageType;
    #message;

    constructor({ messageType, message = '' }) {
        this.#messageType = messageType;
        this.#message = message;
    }

    get messageType() {
        return this.#messageType;
    }
    get message() {
        return this.#message;
    }

    static get type() {
        return this.#type;
    }
}
