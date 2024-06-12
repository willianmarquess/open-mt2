import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterPointsUpdatedEvent {
    static #type = PlayerEventsEnum.CHARACTER_POINTS_UPDATED;

    static get type() {
        return this.#type;
    }
}
