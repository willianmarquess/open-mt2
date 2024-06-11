import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterMovedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_MOVED;

    #virtualId;
    #arg;
    #movementType;
    #time;
    #rotation;
    #positionX;
    #positionY;
    #duration;

    constructor({ virtualId, arg, movementType, time, rotation, positionX, positionY, duration }) {
        this.#virtualId = virtualId;
        this.#arg = arg;
        this.#movementType = movementType;
        this.#time = time;
        this.#rotation = rotation;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#duration = duration;
    }

    get virtualId() {
        return this.#virtualId;
    }

    get arg() {
        return this.#arg;
    }

    get movementType() {
        return this.#movementType;
    }

    get time() {
        return this.#time;
    }

    get rotation() {
        return this.#rotation;
    }

    get positionX() {
        return this.#positionX;
    }

    get positionY() {
        return this.#positionY;
    }

    get duration() {
        return this.#duration;
    }

    static get type() {
        return this.#type;
    }
}
