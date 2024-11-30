import PlayerEventsEnum from './PlayerEventsEnum.js';

export default class OtherCharacterSpawnedEvent {
    static #type = PlayerEventsEnum.OTHER_CHARACTER_SPAWNED;

    #virtualId;
    #playerClass;
    #entityType;
    #attackSpeed;
    #movementSpeed;
    #positionX;
    #positionY;
    #empireId;
    #level;
    #name;
    #rotation;

    constructor({
        virtualId,
        playerClass,
        entityType,
        attackSpeed,
        movementSpeed,
        positionX,
        positionY,
        empireId,
        level,
        name,
        rotation,
    }) {
        this.#virtualId = virtualId;
        this.#playerClass = playerClass;
        this.#entityType = entityType;
        this.#attackSpeed = attackSpeed;
        this.#movementSpeed = movementSpeed;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#empireId = empireId;
        this.#level = level;
        this.#name = name;
        this.#rotation = rotation;
    }

    get virtualId() {
        return this.#virtualId;
    }
    get playerClass() {
        return this.#playerClass;
    }
    get entityType() {
        return this.#entityType;
    }
    get attackSpeed() {
        return this.#attackSpeed;
    }
    get movementSpeed() {
        return this.#movementSpeed;
    }
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get empireId() {
        return this.#empireId;
    }
    get level() {
        return this.#level;
    }
    get name() {
        return this.#name;
    }
    get rotation() {
        return this.#rotation;
    }

    static get type() {
        return this.#type;
    }
}
