import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterSpawnedEvent {
    static #type = PlayerEventsEnum.CHARACTER_SPAWNED;
    static get type() {
        return this.#type;
    }
}
