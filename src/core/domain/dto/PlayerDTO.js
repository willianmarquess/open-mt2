export default class PlayerDTO {
    id;
    updatedAt;
    createdAt;
    accountId;
    empire;
    playerClass;
    skillGroup;
    playTime;
    level;
    experience;
    gold;
    st;
    ht;
    dx;
    iq;
    positionX;
    positionY;
    health;
    mana;
    stamina;
    bodyPart;
    hairPart;
    name;
    givenStatusPoints;
    availableStatusPoints;
    slot;

    constructor({
        id,
        updatedAt,
        createdAt,
        accountId,
        empire,
        playerClass,
        skillGroup = 0,
        playTime = 0,
        level = 1,
        experience = 0,
        gold = 0,
        st = 0,
        ht = 0,
        dx = 0,
        iq = 0,
        positionX,
        positionY,
        health,
        mana,
        stamina,
        bodyPart = 0,
        hairPart = 0,
        name = '',
        givenStatusPoints = 0,
        availableStatusPoints = 0,
        slot = 0,
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.accountId = accountId;
        this.empire = empire;
        this.playerClass = playerClass;
        this.skillGroup = skillGroup;
        this.playTime = playTime;
        this.level = level;
        this.experience = experience;
        this.gold = gold;
        this.st = st;
        this.ht = ht;
        this.dx = dx;
        this.iq = iq;
        this.positionX = positionX;
        this.positionY = positionY;
        this.health = health;
        this.mana = mana;
        this.stamina = stamina;
        this.bodyPart = bodyPart;
        this.hairPart = hairPart;
        this.name = name;
        this.givenStatusPoints = givenStatusPoints;
        this.availableStatusPoints = availableStatusPoints;
        this.slot = slot;
    }
}
