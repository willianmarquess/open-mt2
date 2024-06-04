import { EventEmitter } from 'node:events';
import EntityTypeEnum from '../../../enum/EntityTypeEnum.js';
import PointsEnum from '../../../enum/PointsEnum.js';
import PlayerDTO from '../../dto/PlayerDTO.js';
import Entity from '../Entity.js';
import CharacterSpawnedEvent from './events/CharacterSpawnedEvent.js';
import CharacterInitiatedEvent from './events/CharacterInitiatedEvent.js';
import OtherCharacterUpdatedEvent from './events/OtherCharacterUpdatedEvent.js';
import AnimationTypeEnum from '../../../enum/AnimationTypeEnum.js';
import AnimationSubTypeEnum from '../../../enum/AnimationSubTypeEnum.js';
import MathUtil from '../../util/MathUtil.js';
import EntityStateEnum from '../../../enum/EntityStateEnum.js';
import AnimationUtil from '../../util/AnimationUtil.js';
import CharacterMovedEvent from './events/CharacterMovedEvent.js';
import OtherCharacterMovedEvent from './events/OtherCharacterMovedEvent.js';

export default class Player extends Entity {
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
    #positionX;
    #positionY;
    #stamina;
    #bodyPart;
    #hairPart;
    #name;
    #givenStatusPoints;
    #availableStatusPoints;
    #slot;

    #entityType = EntityTypeEnum.PLAYER;
    #virtualId;

    #points = {};

    #health;
    #maxHealth;
    #baseHealth;
    #hpPerLvl;
    #hpPerHtPoint;

    #mana;
    #maxMana;
    #mpPerLvl;
    #mpPerIqPoint;
    #baseMana;

    #attackSpeed;
    #movementSpeed;

    //animation management
    #targetPositionX = 0;
    #targetPositionY = 0;
    #startPositionX = 0;
    #startPositionY = 0;
    #movementDuration = 0;
    #animationManager;
    #state = EntityStateEnum.IDLE;
    #movementStart = 0;
    #rotation = 0;

    #emitter = new EventEmitter();

    constructor(
        {
            id,
            accountId,
            createdAt,
            updatedAt,
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
        },
        { animationManager },
    ) {
        super({
            id,
            createdAt,
            updatedAt,
        });
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
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#health = health;
        this.#mana = mana;
        this.#stamina = stamina;
        this.#bodyPart = bodyPart;
        this.#hairPart = hairPart;
        this.#name = name;
        this.#givenStatusPoints = givenStatusPoints;
        this.#availableStatusPoints = availableStatusPoints;
        this.#slot = slot;

        //in game values
        this.#virtualId = virtualId;
        this.#hpPerLvl = hpPerLvl;
        this.#hpPerHtPoint = hpPerHtPoint;
        this.#mpPerLvl = mpPerLvl;
        this.#mpPerIqPoint = mpPerIqPoint;
        this.#attackSpeed = baseAttackSpeed;
        this.#movementSpeed = baseMovementSpeed;
        this.#baseMana = baseMana;
        this.#baseHealth = baseHealth;

        this.#animationManager = animationManager;

        this.#initPoints();
    }

    #initPoints() {
        this.#initMaxHealth();
        this.#initMaxMana();

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
    }

    #initMaxHealth() {
        this.#maxHealth = this.#baseHealth + this.#ht * this.#hpPerHtPoint + this.#level * this.#hpPerLvl;
        this.#health = this.#maxHealth;
    }

    #initMaxMana() {
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

    get rotation() {
        return this.#rotation;
    }

    get movementSpeed() {
        return this.#movementSpeed;
    }

    get attackSpeed() {
        return this.#attackSpeed;
    }

    get maxHealth() {
        return this.#maxHealth;
    }

    get maxMana() {
        return this.#maxMana;
    }

    get virtualId() {
        return this.#virtualId;
    }

    get entityType() {
        return this.#entityType;
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

    get movementDuration() {
        return this.#movementDuration;
    }

    static create(
        {
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
            virtualId,
            hpPerLvl,
            hpPerHtPoint,
            mpPerLvl,
            mpPerIqPoint,
            baseAttackSpeed,
            baseMovementSpeed,
            baseHealth,
            baseMana,
        },
        { animationManager },
    ) {
        return new Player(
            {
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
                virtualId,
                hpPerLvl,
                hpPerHtPoint,
                mpPerLvl,
                mpPerIqPoint,
                baseAttackSpeed,
                baseMovementSpeed,
                baseHealth,
                baseMana,
            },
            { animationManager },
        );
    }

    toDatabase() {
        return new PlayerDTO({
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            accountId: this.#accountId,
            empire: this.#empire,
            playerClass: this.#playerClass,
            skillGroup: this.#skillGroup,
            playTime: this.calcPlaytime(),
            level: this.#level,
            experience: this.#experience,
            gold: this.#gold,
            st: this.#st,
            ht: this.#ht,
            dx: this.#dx,
            iq: this.#iq,
            positionX: this.#positionX,
            positionY: this.#positionY,
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

    tick() {
        if (this.#state == EntityStateEnum.MOVING) {
            const elapsed = performance.now() - this.#movementStart;
            let rate = this.#movementDuration == 0 ? 1 : elapsed / this.#movementDuration;
            if (rate > 1) rate = 1;

            const x = (this.#targetPositionX - this.#startPositionX) * rate + this.#startPositionX;
            const y = (this.#targetPositionY - this.#startPositionY) * rate + this.#startPositionY;

            this.#positionX = x;
            this.#positionY = y;

            if (rate >= 1) {
                this.#state = EntityStateEnum.IDLE;
            }
        }
    }

    subscribe(eventName, calback) {
        this.#emitter.on(eventName, calback);
    }

    unsubscribe(eventName) {
        this.#emitter.off(eventName);
    }

    spawn() {
        this.#emitter.emit(CharacterSpawnedEvent.type, new CharacterSpawnedEvent());
    }

    init() {
        this.#emitter.emit(CharacterInitiatedEvent.type, new CharacterInitiatedEvent());
    }

    showOtherEntity(otherEntity) {
        this.#emitter.emit(OtherCharacterUpdatedEvent.type, new OtherCharacterUpdatedEvent({ otherEntity }));
    }

    goto(x, y, args) {
        if (x === this.#positionX && y === this.#positionY) return;
        if (x === this.#targetPositionX && y === this.#targetPositionY) return;

        const animation = this.#animationManager.getAnimation(
            this.#playerClass,
            AnimationTypeEnum.RUN,
            AnimationSubTypeEnum.GENERAL,
        );

        this.#state = EntityStateEnum.MOVING;
        this.#targetPositionX = x;
        this.#targetPositionY = y;
        this.#startPositionX = this.positionX;
        this.#startPositionY = this.positionY;
        this.#movementStart = performance.now();

        const distance = MathUtil.calcDistance(
            this.#startPositionX,
            this.#startPositionY,
            this.#targetPositionX,
            this.#targetPositionY,
        );

        if (animation) {
            this.#movementDuration = AnimationUtil.calcAnimationDuration(animation, this.#movementSpeed, distance);
        }

        this.#rotation = args.rotation * 5;
        this.#emitter.emit(CharacterMovedEvent.type, new CharacterMovedEvent({ params: args, entity: this }));
    }

    updateOtherEntity(otherEntity, args) {
        this.#emitter.emit(OtherCharacterMovedEvent.type, new OtherCharacterMovedEvent({ otherEntity, params: args }));
    }

    move(x, y) {
        if (x === this.#positionX && y === this.#positionY) return;
        this.#positionX = x;
        this.#positionY = y;
        //send moveEvent
    }

    wait(x, y, args) {
        this.#positionX = x;
        this.#positionY = y;
        this.#emitter.emit(CharacterMovedEvent.type, new CharacterMovedEvent({ params: args, entity: this }));
    }

    stop() {
        this.#state = EntityStateEnum.IDLE;
        this.#movementDuration = 0;
    }
}
