import Entity from './Entity.js';

export default class Player extends Entity {
    #accountId;
    #empire;
    #playerClass;
    #skillGroup = 0;
    #playTime = 0;
    #level = 1;
    #experience = 0;
    #gold = 0;
    #st = 0;
    #ht = 0;
    #dx = 0;
    #iq = 0;
    #positionX;
    #positionY;
    #health;
    #mana;
    #stamina;
    #bodyPart = 0;
    #hairPart = 0;
    #name;
    #givenStatusPoints = 0;
    #availableStatusPoints = 0;
    #slot = 0;

    constructor({
        id,
        accountId,
        createdAt,
        updatedAt,
        empire,
        playerClass,
        skillGroup,
        playTime,
        level,
        experience,
        gold,
        st,
        ht,
        dx,
        iq,
        positionX,
        positionY,
        health,
        mana,
        stamina,
        bodyPart,
        hairPart,
        name,
        givenStatusPoints,
        availableStatusPoints,
        slot,
    }) {
        super({
            id,
            createdAt,
            updatedAt,
        });
        this.#accountId = accountId;
        this.#empire = empire;
        this.#playerClass = playerClass;
        this.#skillGroup = skillGroup ?? this.#skillGroup;
        this.#playTime = playTime ?? this.#playTime;
        this.#level = level ?? this.#level;
        this.#experience = experience ?? this.#experience;
        this.#gold = gold ?? this.#gold;
        this.#st = st ?? this.#st;
        this.#ht = ht ?? this.#ht;
        this.#dx = dx ?? this.#dx;
        this.#iq = iq ?? this.#iq;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#health = health;
        this.#mana = mana;
        this.#stamina = stamina;
        this.#bodyPart = bodyPart ?? this.#bodyPart;
        this.#hairPart = hairPart ?? this.#hairPart;
        this.#name = name;
        this.#givenStatusPoints = givenStatusPoints ?? this.#givenStatusPoints;
        this.#availableStatusPoints = availableStatusPoints ?? this.#availableStatusPoints;
        this.#slot = slot ?? this.#slot;
    }

    get accountId() {
        return this.#accountId;
    }
    get empire() {
        return this.#empire;
    }
    get playerClass() {
        return this.#playerClass;
    }
    get skillGroup() {
        return this.#skillGroup;
    }
    get playTime() {
        return this.#playTime;
    }
    get level() {
        return this.#level;
    }
    get experience() {
        return this.#experience;
    }
    get gold() {
        return this.#gold;
    }
    get st() {
        return this.#st;
    }
    get ht() {
        return this.#ht;
    }
    get dx() {
        return this.#dx;
    }
    get iq() {
        return this.#iq;
    }
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get health() {
        return this.#health;
    }
    get mana() {
        return this.#mana;
    }
    get stamina() {
        return this.#stamina;
    }
    get bodyPart() {
        return this.#bodyPart;
    }
    get hairPart() {
        return this.#hairPart;
    }
    get name() {
        return this.#name;
    }
    get givenStatusPoints() {
        return this.#givenStatusPoints;
    }
    get availableStatusPoints() {
        return this.#availableStatusPoints;
    }

    get slot() {
        return this.#slot;
    }

    static create({
        id,
        accountId,
        createdAt,
        updatedAt,
        empire,
        playerClass,
        skillGroup,
        playTime,
        level,
        experience,
        gold,
        st,
        ht,
        dx,
        iq,
        positionX,
        positionY,
        health,
        mana,
        stamina,
        bodyPart,
        hairPart,
        name,
        givenStatusPoints,
        availableStatusPoints,
        slot,
    }) {
        return new Player({
            id,
            accountId,
            createdAt,
            updatedAt,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
        });
    }
}
