import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterUpdatedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_UPDATED;
    static get type() {
        return this.#type;
    }

    #vid;
    #attackSpeed;
    #moveSpeed;
    #bodyId;
    #weaponId;
    #hairId;

    constructor({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId }) {
        this.#vid = vid;
        this.#attackSpeed = attackSpeed;
        this.#moveSpeed = moveSpeed;
        this.#weaponId = weaponId;
        this.#bodyId = bodyId;
        this.#hairId = hairId;
    }

    get vid() {
        return this.#vid;
    }
    get attackSpeed() {
        return this.#attackSpeed;
    }
    get moveSpeed() {
        return this.#moveSpeed;
    }
    get weaponId() {
        return this.#weaponId;
    }
    get bodyId() {
        return this.#bodyId;
    }
    get hairId() {
        return this.#hairId;
    }
}
