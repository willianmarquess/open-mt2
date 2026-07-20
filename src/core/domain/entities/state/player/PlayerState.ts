import StateEntity from '../StateEntity';

export default class PlayerState extends StateEntity {
    public readonly accountId: number;
    public readonly empire: number;
    public readonly playerClass: number;
    public readonly skillGroup: number;
    public readonly playTime: number;
    public readonly level: number;
    public readonly experience: number;
    public readonly gold: number;
    public readonly st: number;
    public readonly ht: number;
    public readonly dx: number;
    public readonly iq: number;
    public readonly positionX: number;
    public readonly positionY: number;
    public readonly health: number;
    public readonly mana: number;
    public readonly stamina: number;
    public readonly bodyPart: number;
    public readonly hairPart: number;
    public readonly name: string;
    public readonly givenStatusPoints: number;
    public readonly availableStatusPoints: number;
    public readonly slot: number;
    public readonly quickSlot: Map<number, { type: number; position: number }> = new Map();

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
        quickSlot,
    }: {
        id: number;
        updatedAt?: Date;
        createdAt?: Date;
        accountId: number;
        empire: number;
        playerClass: number;
        skillGroup: number;
        playTime: number;
        level: number;
        experience: number;
        gold: number;
        st: number;
        ht: number;
        dx: number;
        iq: number;
        positionX: number;
        positionY: number;
        health: number;
        mana: number;
        stamina: number;
        bodyPart: number;
        hairPart: number;
        name: string;
        givenStatusPoints: number;
        availableStatusPoints: number;
        slot: number;
        quickSlot?: Map<number, { type: number; position: number }>;
    }) {
        super(id, createdAt, updatedAt);
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
        this.quickSlot = quickSlot || new Map();
    }
}
