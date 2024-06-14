import EntityTypeEnum from '../../../../enum/EntityTypeEnum.js';
import PointsEnum from '../../../../enum/PointsEnum.js';
import PlayerDTO from '../../../dto/PlayerDTO.js';
import CharacterSpawnedEvent from './events/CharacterSpawnedEvent.js';
import OtherCharacterUpdatedEvent from './events/OtherCharacterUpdatedEvent.js';
import CharacterMovedEvent from './events/CharacterMovedEvent.js';
import OtherCharacterMovedEvent from './events/OtherCharacterMovedEvent.js';
import CharacterPointsUpdatedEvent from './events/CharacterPointsUpdatedEvent.js';
import CharacterLevelUpEvent from './events/CharacterLevelUpEvent.js';
import OtherCharacterLevelUpEvent from './events/OtherCharacterLevelUpEvent.js';
import GameEntity from '../GameEntity.js';
import OtherEntityLeftGameEvent from './events/OtherEntityLeftGameEvent.js';

export default class Player extends GameEntity {
    #accountId;
    #empire;
    #playerClass;
    #skillGroup;
    #playTime;
    #level;
    #experience;
    #gold;
    #st;
    #ht;
    #dx;
    #iq;
    #stamina;
    #bodyPart;
    #hairPart;
    #name;
    #givenStatusPoints;
    #availableStatusPoints;
    #slot;

    #appearance;
    #points = {};

    #health;
    #baseHealth;
    #hpPerLvl;
    #hpPerHtPoint;
    #mana;
    #mpPerLvl;
    #mpPerIqPoint;
    #baseMana;

    #experienceManager;
    #config;

    //in game points
    #maxHealth;
    #maxMana;
    #attackSpeed;
    #movementSpeed;
    // #neededExperience;
    // #defenseGrade;
    // #attackGrade;
    // #defense;
    // #statusPoints;
    // #subSkill;
    // #skill;
    // #minAttackDamage;
    // #maxAttackDamage;
    // #criticalPercentage;
    // #penetratePercentage;
    // #itemDropBonus;
    // #attackBonus;
    // #defenseBonus;
    // #mallItemBonus;
    // #magicAttackBonus;
    // #resistCritical;
    // #resistPenetrate;
    // #minWeaponDamage;
    // #maxWeaponDamage;

    #lastPlayTime;

    constructor(
        {
            id,
            accountId,
            empire,
            playerClass = 0,
            skillGroup = 0,
            playTime = 0,
            level = 1,
            experience = 0,
            gold = 0,
            st = 0,
            ht = 0,
            dx = 0,
            iq = 0,
            positionX = 0,
            positionY = 0,
            health = 0,
            mana = 0,
            stamina = 0,
            bodyPart = 0,
            hairPart = 0,
            name,
            givenStatusPoints = 0,
            availableStatusPoints = 0,
            slot = 0,
            virtualId = 0,
            hpPerLvl = 0,
            hpPerHtPoint = 0,
            mpPerLvl = 0,
            mpPerIqPoint = 0,
            baseAttackSpeed = 0,
            baseMovementSpeed = 0,
            baseHealth = 0,
            baseMana = 0,
            appearance = 0,
        },
        { animationManager, experienceManager, config },
    ) {
        super(
            {
                id,
                classId: playerClass,
                virtualId,
                positionX,
                positionY,
                entityType: EntityTypeEnum.PLAYER,
                attackSpeed: baseAttackSpeed,
                movementSpeed: baseMovementSpeed,
            },
            {
                animationManager,
            },
        );

        this.#accountId = accountId;
        this.#empire = empire;
        this.#playerClass = playerClass;
        this.#skillGroup = skillGroup;
        this.#playTime = playTime;
        this.#level = level;
        this.#experience = experience;
        this.#gold = gold;
        this.#st = st;
        this.#ht = ht;
        this.#dx = dx;
        this.#iq = iq;
        this.#health = health;
        this.#mana = mana;
        this.#stamina = stamina;
        this.#bodyPart = bodyPart;
        this.#hairPart = hairPart;
        this.#name = name;
        this.#givenStatusPoints = givenStatusPoints;
        this.#availableStatusPoints = availableStatusPoints;
        this.#slot = slot;
        this.#appearance = appearance;

        //in game values
        this.#hpPerLvl = hpPerLvl;
        this.#hpPerHtPoint = hpPerHtPoint;
        this.#mpPerLvl = mpPerLvl;
        this.#mpPerIqPoint = mpPerIqPoint;
        this.#baseMana = baseMana;
        this.#baseHealth = baseHealth;
        this.#experienceManager = experienceManager;
        this.#config = config;

        this.#initPoints();
    }

    #initPoints() {
        this.#updateHealth();
        this.#updateMana();

        this.#points[PointsEnum.EXPERIENCE] = () => this.#experience;
        this.#points[PointsEnum.HT] = () => this.#ht;
        this.#points[PointsEnum.ST] = () => this.#st;
        this.#points[PointsEnum.IQ] = () => this.#iq;
        this.#points[PointsEnum.DX] = () => this.#dx;
        this.#points[PointsEnum.LEVEL] = () => this.#level;
        this.#points[PointsEnum.MAX_HP] = () => this.#maxHealth;
        this.#points[PointsEnum.MAX_MP] = () => this.#maxMana;
        this.#points[PointsEnum.HP] = () => this.#health;
        this.#points[PointsEnum.MP] = () => this.#mana;
        this.#points[PointsEnum.ATTACK_SPEED] = () => this.#attackSpeed;
        this.#points[PointsEnum.MOVE_SPEED] = () => this.#movementSpeed;
        this.#points[PointsEnum.NEEDED_EXPERIENCE] = () => this.#experienceManager.getNeededExperience(this.#level);
        this.#points[PointsEnum.STATUS_POINTS] = () => this.#availableStatusPoints;
    }

    #updateStatusPoints() {
        const baseStatusPoints = (this.#level - 1) * this.#config.POINTS_PER_LEVEL;

        const expNeeded = this.#experienceManager.getNeededExperience(this.#level);
        const experienceRatio = this.#experience / expNeeded;

        const totalStatusPoints = Math.floor(baseStatusPoints + experienceRatio * 4);

        const excessPoints = this.#givenStatusPoints - totalStatusPoints;
        this.#availableStatusPoints -= Math.min(excessPoints, this.#availableStatusPoints);

        this.#givenStatusPoints -= excessPoints;
        this.#availableStatusPoints += totalStatusPoints - this.#givenStatusPoints;
        this.#givenStatusPoints = totalStatusPoints;
    }

    addExperience(value) {
        if (value < 1 || this.#level >= this.#config.MAX_LEVEL) return;

        const expNeeded = this.#experienceManager.getNeededExperience(this.#level);

        if (this.#experience + value >= expNeeded) {
            const diff = this.#experience + value - expNeeded;
            this.#experience = diff;
            this.addLevel(1);
            this.#updateStatusPoints();
            this.addExperience(0);
            return;
        }

        const expPart = expNeeded / 4;
        const before = this.#experience;
        this.#experience += value;

        const beforePart = before / expPart;
        const afterPart = this.#experience / expPart;
        const expSteps = afterPart - beforePart;

        if (expSteps > 0) {
            this.#health = this.#maxHealth;
            this.#mana = this.#maxMana;
            this.#updateStatusPoints();
            this.#sendPoints();
        }
    }

    addLevel(value) {
        if (this.#level + value > this.#config.MAX_LEVEL) return;
        if (value < 1) return;

        //add skill point
        this.#level += value;
        this.#updateHealth();
        this.#updateMana();
        this.#updateStatusPoints();
        this.#sendPoints();

        this.publish(CharacterLevelUpEvent.type, new CharacterLevelUpEvent({ entity: this }));
    }

    addMovementSpeed(value) {
        this.#movementSpeed += value > 0 ? value : 0;
    }

    addAttackSpeed(value) {
        this.#attackSpeed += value > 0 ? value : 0;
    }

    addMana(value) {
        this.#mana += value > 0 ? value : 0;
    }

    addMaxMana(value) {
        this.#maxMana += value > 0 ? value : 0;
    }

    addHealth(value) {
        this.#health += value > 0 ? value : 0;
    }

    addMaxHealth(value) {
        this.#maxHealth += value > 0 ? value : 0;
    }

    #updateHealth() {
        this.#maxHealth = this.#baseHealth + this.#ht * this.#hpPerHtPoint + this.#level * this.#hpPerLvl;
        this.#health = this.#maxHealth;
    }

    #updateMana() {
        this.#maxMana = this.#baseMana + this.#iq * this.#mpPerIqPoint + this.#level * this.#mpPerLvl;
        this.#mana = this.#maxMana;
    }

    getPoint(point) {
        if (this.#points[point]) {
            return this.#points[point]();
        }
        return 0;
    }

    getPoints() {
        return this.#points;
    }

    spawn() {
        this.#lastPlayTime = performance.now();
        this.publish(CharacterSpawnedEvent.type, new CharacterSpawnedEvent());
    }

    showOtherEntity(otherEntity) {
        this.publish(OtherCharacterUpdatedEvent.type, new OtherCharacterUpdatedEvent({ otherEntity }));
    }

    hideOtherEntity(otherEntity) {
        this.publish(OtherEntityLeftGameEvent.type, new OtherEntityLeftGameEvent({ otherEntity }));
    }

    otherEntityLevelUp({ virtualId, level }) {
        this.publish(OtherCharacterLevelUpEvent.type, new OtherCharacterLevelUpEvent({ virtualId, level }));
    }

    #sendPoints() {
        this.publish(CharacterPointsUpdatedEvent.type, new CharacterPointsUpdatedEvent());
    }

    updateOtherEntity({ virtualId, arg, movementType, time, rotation, positionX, positionY, duration }) {
        this.publish(
            OtherCharacterMovedEvent.type,
            new OtherCharacterMovedEvent({
                virtualId,
                arg,
                movementType,
                time,
                rotation,
                positionX,
                positionY,
                duration,
            }),
        );
    }

    wait({ positionX, positionY, arg, rotation, time, movementType }) {
        super.wait(positionX, positionY);
        this.publish(
            CharacterMovedEvent.type,
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
    }

    goto({ positionX, positionY, arg, rotation, time, movementType }) {
        super.goto(positionX, positionY, rotation);
        this.publish(
            CharacterMovedEvent.type,
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: this.movementDuration },
                entity: this,
            }),
        );
    }

    move(x, y) {
        super.move(x, y);
        //send moveEvent
    }

    #calcPlayTime() {
        return this.#playTime + Math.round((performance.now() - this.#lastPlayTime) / (1000 * 60));
    }

    static create(
        {
            id,
            accountId,
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
            virtualId,
            hpPerLvl,
            hpPerHtPoint,
            mpPerLvl,
            mpPerIqPoint,
            baseAttackSpeed,
            baseMovementSpeed,
            baseHealth,
            baseMana,
            appearance,
        },
        { animationManager, config, experienceManager },
    ) {
        return new Player(
            {
                id,
                accountId,
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
                virtualId,
                hpPerLvl,
                hpPerHtPoint,
                mpPerLvl,
                mpPerIqPoint,
                baseAttackSpeed,
                baseMovementSpeed,
                baseHealth,
                baseMana,
                appearance,
            },
            { animationManager, config, experienceManager },
        );
    }

    toDatabase() {
        return new PlayerDTO({
            id: this.id,
            accountId: this.#accountId,
            empire: this.#empire,
            playerClass: this.#playerClass,
            skillGroup: this.#skillGroup,
            playTime: this.#calcPlayTime(),
            level: this.#level,
            experience: this.#experience,
            gold: this.#gold,
            st: this.#st,
            ht: this.#ht,
            dx: this.#dx,
            iq: this.#iq,
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.#health,
            mana: this.#mana,
            stamina: this.#stamina,
            bodyPart: this.#bodyPart,
            hairPart: this.#hairPart,
            name: this.#name,
            givenStatusPoints: this.#givenStatusPoints,
            availableStatusPoints: this.#availableStatusPoints,
            slot: this.#slot,
        });
    }

    get appearance() {
        return this.#appearance;
    }
    get maxHealth() {
        return this.#maxHealth;
    }
    get maxMana() {
        return this.#maxMana;
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
}
