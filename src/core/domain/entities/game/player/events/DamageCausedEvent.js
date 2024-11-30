import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class DamageCausedEvent {
    static #type = PlayerEventsEnum.DAMAGE_CAUSED;

    #virtualId;
    #damage;
    #damageFlags;

    constructor({ virtualId, damage, damageFlags }) {
        this.#virtualId = virtualId;
        this.#damage = damage;
        this.#damageFlags = damageFlags;
    }

    get virtualId() {
        return this.#virtualId;
    }
    get damage() {
        return this.#damage;
    }
    get damageFlags() {
        return this.#damageFlags;
    }
    static get type() {
        return this.#type;
    }
}
