import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterTeleportedEvent {
    static #type = PlayerEventsEnum.CHARACTER_TELEPORTED;
    static get type() {
        return this.#type;
    }
}
