import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterInitiatedEvent {
    static #type = PlayerEventsEnum.CHARACTER_INITIATED;
    static get type() {
        return this.#type;
    }
}
