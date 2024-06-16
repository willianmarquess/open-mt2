import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class LogoutEvent {
    static #type = PlayerEventsEnum.LOGOUT;

    static get type() {
        return this.#type;
    }
}
