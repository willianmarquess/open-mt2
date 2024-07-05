import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class CharacterUpdatedEvent {
    static #type = PlayerEventsEnum.CHARACTER_UPDATED;
    static get type() {
        return this.#type;
    }

    #vid;
    #attackSpeed;
    #moveSpeed;
    #positionX;
    #positionY;
    #name;
    #bodyId;
    #weaponId;
    #hairId;

    constructor({ vid, attackSpeed, moveSpeed, positionX, positionY, name, bodyId, weaponId, hairId }) {
        this.#vid = vid;
        this.#attackSpeed = attackSpeed;
        this.#moveSpeed = moveSpeed;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#name = name;
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
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get name() {
        return this.#name;
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
