export default class PlayerDTO {
    public id: number;
    public updatedAt?: Date;
    public createdAt?: Date;
    public accountId: number;
    public empire: number;
    public playerClass: number;
    public skillGroup: number;
    public playTime: number;
    public level: number;
    public experience: number;
    public gold: number;
    public st: number;
    public ht: number;
    public dx: number;
    public iq: number;
    public positionX: number;
    public positionY: number;
    public health: number;
    public mana: number;
    public stamina: number;
    public bodyPart: number;
    public hairPart: number;
    public name: string;
    public givenStatusPoints: number;
    public availableStatusPoints: number;
    public slot: number;

    constructor({
        id,
        updatedAt = new Date(),
        createdAt = new Date(),
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
