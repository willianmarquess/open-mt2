import EntityTypeEnum from '../../../../enum/EntityTypeEnum.js';
import PointsEnum from '../../../../enum/PointsEnum.js';
import PlayerDTO from '../../../dto/PlayerDTO.js';
import CharacterSpawnedEvent from './events/CharacterSpawnedEvent.js';
import OtherCharacterSpawnedEvent from './events/OtherCharacterSpawnedEvent.js';
import CharacterMovedEvent from './events/CharacterMovedEvent.js';
import OtherCharacterMovedEvent from './events/OtherCharacterMovedEvent.js';
import CharacterPointsUpdatedEvent from './events/CharacterPointsUpdatedEvent.js';
import CharacterLevelUpEvent from './events/CharacterLevelUpEvent.js';
import OtherCharacterLevelUpEvent from './events/OtherCharacterLevelUpEvent.js';
import GameEntity from '../GameEntity.js';
import OtherCharacterLeftGameEvent from './events/OtherCharacterLeftGameEvent.js';
import ChatEvent from './events/ChatEvent.js';
import ChatMessageTypeEnum from '../../../../enum/ChatMessageTypeEnum.js';
import LogoutEvent from './events/LogoutEvent.js';
import JobUtil from '../../../util/JobUtil.js';
import MathUtil from '../../../util/MathUtil.js';
import CharacterTeleportedEvent from './events/CharacterTeleportedEvent.js';
import Inventory from '../inventory/Inventory.js';
import ItemAntiFlagEnum from '../../../../enum/ItemAntiFlagEnum.js';
import CharacterUpdatedEvent from './events/CharacterUpdatedEvent.js';
import InventoryEventsEnum from '../inventory/events/InventoryEventsEnum.js';
import OtherCharacterUpdatedEvent from './events/OtherCharacterUpdatedEvent.js';
import EntityStateEnum from '../../../../enum/EntityStateEnum.js';
import DroppedItem from '../item/DroppedItem.js';
import PlayerInventory from './delegate/PlayerInventory.js';
import PlayerApplies from './delegate/PlayerApplies.js';
import PlayerBattle from './delegate/PlayerBattle.js';
import DamageCausedEvent from './events/DamageCausedEvent.js';
import TargetUpdatedEvent from './events/TargetUpdatedEvent.js';
import OtherCharacterDiedEvent from './events/OtherCharacterDiedEvent.js';

const REGEN_INTERVAL = 3000;

export default class Player extends GameEntity {
    #accountId;
    #playerClass;
    #skillGroup;
    #playTime;
    #experience;
    #gold;
    #stamina;
    #bodyPart;
    #hairPart;
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
    #defense = 0;
    #defensePerHtPoint = 0;
    #attack = 0;
    #attackBonus = 0;
    #attackPerStPoint = 0;
    #attackPerDXPoint = 0;
    #attackPerIQPoint = 0;
    #magicAttack = 0;
    #magicAttackBonus = 0;
    #magicDefense = 0;
    #magicDefenseBonus = 0;
    #healthRegenBonus = 0;
    #manaRegenBonus = 0;
    // #attackSpeed;
    // #movementSpeed;
    // #neededExperience;
    // #defenseGrade;
    // #attackGrade;
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

    #lastPlayTime = performance.now();
    #inventory;

    //delegate
    #playerInventory;
    #playerApplies;
    #playerBattle;

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
            defensePerHtPoint = 0,
            attackPerStPoint = 0,
            attackPerDXPoint = 0,
            attackPerIQPoint = 0,
        },
        { animationManager, experienceManager, config, logger },
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
                dx,
                ht,
                iq,
                st,
                name,
                level,
                empire,
            },
            {
                animationManager,
            },
        );
        this.#accountId = accountId;
        this.#playerClass = playerClass;
        this.#skillGroup = skillGroup;
        this.#playTime = playTime;
        this.#experience = experience;
        this.#gold = gold;
        this.#health = health;
        this.#mana = mana;
        this.#stamina = stamina;
        this.#bodyPart = bodyPart;
        this.#hairPart = hairPart;
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
        this.#defensePerHtPoint = defensePerHtPoint;
        this.#attackPerStPoint = attackPerStPoint;
        this.#attackPerDXPoint = attackPerDXPoint;
        this.#attackPerIQPoint = attackPerIQPoint;
        this.#experienceManager = experienceManager;
        this.#config = config;
        this.#inventory = new Inventory({ config: this.#config, ownerId: this.id });
        this.#inventory.subscribe(InventoryEventsEnum.ITEM_EQUIPPED, this.#onItemEquipped.bind(this));
        this.#inventory.subscribe(InventoryEventsEnum.ITEM_UNEQUIPPED, this.#onItemUnequipped.bind(this));

        this.#playerInventory = new PlayerInventory(this);
        this.#playerApplies = new PlayerApplies(this, logger);
        this.#playerBattle = new PlayerBattle(this, logger);

        this.#init();
    }

    #init() {
        this.#updateHealth();
        this.#resetHealth();
        this.#updateMana();
        this.#resetMana();
        this.#updateDefense();
        this.#updateAttack();

        this.#points[PointsEnum.EXPERIENCE] = () => this.#experience;
        this.#points[PointsEnum.HT] = () => this.ht;
        this.#points[PointsEnum.ST] = () => this.st;
        this.#points[PointsEnum.IQ] = () => this.iq;
        this.#points[PointsEnum.DX] = () => this.dx;
        this.#points[PointsEnum.LEVEL] = () => this.level;
        this.#points[PointsEnum.MAX_HP] = () => this.#maxHealth;
        this.#points[PointsEnum.MAX_MP] = () => this.#maxMana;
        this.#points[PointsEnum.HP] = () => this.#health;
        this.#points[PointsEnum.MP] = () => this.#mana;
        this.#points[PointsEnum.ATTACK_SPEED] = () => this.attackSpeed;
        this.#points[PointsEnum.MOVE_SPEED] = () => this.movementSpeed;
        this.#points[PointsEnum.NEEDED_EXPERIENCE] = () => this.#experienceManager.getNeededExperience(this.level);
        this.#points[PointsEnum.STATUS_POINTS] = () => this.#availableStatusPoints;
        this.#points[PointsEnum.GOLD] = () => this.#gold;
        this.#points[PointsEnum.DEFENSE] = () => this.#defense;
        this.#points[PointsEnum.DEFENSE_GRADE] = () => this.#defense;
        this.#points[PointsEnum.ATTACK_GRADE] = () => this.#attack;
        this.#points[PointsEnum.MAGIC_ATT_GRADE] = () => this.#magicAttack;
        this.#points[PointsEnum.MAGIC_DEF_GRADE] = () => this.#magicDefense;

        setInterval(this.#regenHealth.bind(this), REGEN_INTERVAL);
        setInterval(this.#regenMana.bind(this), REGEN_INTERVAL);
    }

    otherEntityDied(entity) {
        this.publish(OtherCharacterDiedEvent.type, new OtherCharacterDiedEvent({ virtualId: entity.virtualId }));
    }

    getHealthPercentage() {
        return Math.round(Math.max(0, Math.min(100, (this.#health * 100) / this.#maxHealth)));
    }

    setTarget(target) {
        super.setTarget(target);
        this.sendTargetUpdated(target);
    }

    sendTargetUpdated(target) {
        this.publish(
            TargetUpdatedEvent.type,
            new TargetUpdatedEvent({
                virtualId: target.virtualId,
                healthPercentage: target.getHealthPercentage(),
            }),
        );
    }

    attack(victim, attackType) {
        return this.#playerBattle.attack(victim, attackType);
    }

    sendDamageCaused({ virtualId, damage, damageFlags }) {
        this.publish(
            DamageCausedEvent.type,
            new DamageCausedEvent({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    #regenHealth() {
        if (this.#health >= this.#maxHealth) return;

        let percent = this.state === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.#healthRegenBonus / 100);
        const amount = this.#maxHealth * (percent / 100);
        this.addHealth(Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[HP REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.#sendPoints();
    }

    #regenMana() {
        if (this.#mana >= this.#maxMana) return;

        let percent = this.state === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.#manaRegenBonus / 100);
        const amount = this.#maxMana * (percent / 100);
        this.addMana(Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[MANA REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.#sendPoints();
    }

    #onEquipmentChange() {
        this.#updateDefense();
        this.#updateMagicDefense();
        this.#updateAttack();
        this.#updateHealth();
        this.#updateMana();
        this.updateView();
        this.#sendPoints();
    }

    #onItemEquipped({ item }) {
        this.#playerApplies.addItemApplies(item);
        this.#onEquipmentChange();
    }

    #onItemUnequipped({ item }) {
        this.#playerApplies.removeItemApplies(item);
        this.#onEquipmentChange();
    }

    getAttack() {
        let attack =
            this.level * 2 +
            this.#attackPerStPoint * this.st +
            this.#attackPerIQPoint * this.iq +
            this.#attackPerDXPoint * this.dx;
        attack += this.#attackBonus;
        const { physic } = this.#inventory.getWeaponValues();
        attack += Math.floor(Math.random() * (physic.max - physic.min) + physic.min) * 2;
        attack += physic.bonus * 2;
        return Math.floor(attack);
    }

    getMagicAttack() {
        let magicAttack = this.level * 2 + 2 * this.iq;
        magicAttack += this.#magicAttackBonus;
        const { magic } = this.#inventory.getWeaponValues();
        magicAttack += Math.floor(Math.random() * (magic.max - magic.min) + magic.min) * 2;
        magicAttack += magic.bonus * 2;
        return Math.floor(magicAttack);
    }

    getDefense() {
        let defense = this.level + Math.floor(this.#defensePerHtPoint * this.ht);
        const armorValues = this.#inventory.getArmorValues();
        armorValues.forEach(({ flat, multi }) => {
            defense += flat;
            defense += multi * 2;
        });
        return Math.floor(defense);
    }

    getMagicDefense() {
        let magicDefense = this.level + (this.iq * 3 + this.ht / 3 + this.getDefense() / 2);
        magicDefense += this.#magicDefenseBonus;
        return Math.floor(magicDefense);
    }

    #updateAttack() {
        this.#attack = this.getAttack();
    }

    #updateMagicAttack() {
        this.#magicAttack = this.getMagicAttack();
    }

    #updateDefense() {
        this.#defense = this.getDefense();
    }

    #updateMagicDefense() {
        this.#magicDefense = this.getMagicDefense();
    }

    addStat(stat, value = 1) {
        if (!['st', 'ht', 'dx', 'iq'].includes(stat)) return;
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue === 0 || validatedValue > this.#availableStatusPoints) return;

        let realValue = 0;
        if (this[stat] + validatedValue > this.#config.MAX_POINTS) {
            const diff = this.#config.MAX_POINTS - this[stat];
            realValue = diff;
        } else {
            realValue = validatedValue;
        }

        this[stat] += realValue;
        this.#givenStatusPoints += realValue;
        this.#availableStatusPoints -= realValue;

        switch (stat) {
            case 'st':
                this.#updateAttack();
                this.#sendPoints();
                break;
            case 'ht':
                this.#updateDefense();
                this.#updateMagicDefense();
                this.#updateHealth();
                this.#sendPoints();
                break;
            case 'dx':
                this.#updateAttack();
                this.#sendPoints();
                break;
            case 'iq':
                this.#updateAttack();
                this.#updateMagicAttack();
                this.#updateMagicDefense();
                this.#updateMana();
                break;
        }

        this.#sendPoints();
    }

    #updateStatusPoints() {
        const baseStatusPoints = (this.level - 1) * this.#config.POINTS_PER_LEVEL;

        const expNeeded = this.#experienceManager.getNeededExperience(this.level);
        const experienceRatio = this.#experience / expNeeded;

        const totalStatusPoints = Math.floor(baseStatusPoints + experienceRatio * 4);

        const excessPoints = this.#givenStatusPoints - totalStatusPoints;
        this.#availableStatusPoints -= Math.min(excessPoints, this.#availableStatusPoints);

        this.#givenStatusPoints -= excessPoints;
        this.#availableStatusPoints += totalStatusPoints - this.#givenStatusPoints;
        this.#givenStatusPoints = totalStatusPoints;
    }

    teleport(x, y) {
        this.move(x, y);
        this.stop();

        this.publish(CharacterTeleportedEvent.type, new CharacterTeleportedEvent());
    }

    addGold(value = 1) {
        const validatedValue = MathUtil.toNumber(value);
        if (validatedValue === 0) return;

        this.#gold = Math.min(this.#gold + validatedValue, MathUtil.MAX_UINT);
        this.#sendPoints();
    }

    addExperience(value) {
        const validatedValue = MathUtil.toUnsignedNumber(value);

        if (validatedValue < 0 || (this.level >= this.#config.MAX_LEVEL && this.#experience === 0)) return;

        if (this.level >= this.#config.MAX_LEVEL) {
            this.#experience = 0;
            this.#updateStatusPoints();
            this.#sendPoints();
            return;
        }

        const expNeeded = this.#experienceManager.getNeededExperience(this.level);

        if (this.#experience + validatedValue >= expNeeded) {
            const diff = this.#experience + validatedValue - expNeeded;
            this.#experience = diff;
            this.addLevel(1);
            this.#updateStatusPoints();
            this.addExperience(0);
            return;
        }

        const expPart = expNeeded / 4;
        const before = this.#experience;
        this.#experience += validatedValue;

        const beforePart = before / expPart;
        const afterPart = this.#experience / expPart;
        const expSteps = Math.floor(afterPart) - Math.floor(beforePart);

        if (expSteps > 0) {
            this.#health = this.#maxHealth;
            this.#mana = this.#maxMana;
            this.#updateStatusPoints();
        }
        this.#sendPoints();
    }

    addLevel(value) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (this.level + validatedValue > this.#config.MAX_LEVEL) return;
        if (validatedValue < 1) return;

        //add skill point
        this.level += validatedValue;
        this.#updateHealth();
        this.#resetHealth();
        this.#updateMana();
        this.#resetMana();
        this.#updateStatusPoints();
        this.#updateAttack();
        this.#updateMagicAttack();
        this.#updateDefense();
        this.#sendPoints();

        //verify if we really need to send this
        this.publish(CharacterLevelUpEvent.type, new CharacterLevelUpEvent({ entity: this }));
    }

    setLevel(value = 1) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue < 1 || validatedValue > this.#config.MAX_LEVEL) return;

        this.level = validatedValue;
        //reset skills

        this.#givenStatusPoints = 0;
        this.#availableStatusPoints = 0;
        this.#experience = 0;
        const className = JobUtil.getClassNameFromClassId(this.#playerClass);
        this.st = this.#config.jobs[className].common.st;
        this.ht = this.#config.jobs[className].common.ht;
        this.dx = this.#config.jobs[className].common.dx;
        this.iq = this.#config.jobs[className].common.iq;

        this.#updateHealth();
        this.#resetHealth();
        this.#updateMana();
        this.#resetMana();
        this.#updateStatusPoints();
        this.#updateAttack();
        this.#updateDefense();
        this.#sendPoints();

        //add skill point
        //verify if we really need to send this
        this.publish(CharacterLevelUpEvent.type, new CharacterLevelUpEvent({ entity: this }));
    }

    addHealthRegen(value) {
        const validatedValue = Math.min(this.#healthRegenBonus + value, MathUtil.MAX_UINT);
        this.#healthRegenBonus += validatedValue;
    }

    addManaRegen(value) {
        const validatedValue = Math.min(this.#manaRegenBonus + value, MathUtil.MAX_UINT);
        this.#manaRegenBonus = validatedValue;
    }

    addMovementSpeed(value) {
        const validatedValue = Math.min(this.movementSpeed + value, MathUtil.MAX_TINY);
        this.movementSpeed = validatedValue;
    }

    addAttackSpeed(value) {
        const validatedValue = Math.min(this.attackSpeed + value, MathUtil.MAX_TINY);
        this.attackSpeed = validatedValue;
    }

    addMana(value) {
        this.#mana = Math.min(this.#mana + Math.max(value, 0), this.#maxMana);
    }

    addMaxMana(value) {
        this.#maxMana += MathUtil.toUnsignedNumber(value);
    }

    addHealth(value) {
        this.#health = Math.min(this.#health + Math.max(value, 0), this.#maxHealth);
    }

    addMaxHealth(value) {
        this.#maxHealth += MathUtil.toUnsignedNumber(value);
    }

    #updateHealth() {
        this.#maxHealth = this.#baseHealth + this.ht * this.#hpPerHtPoint + this.level * this.#hpPerLvl;
    }

    #resetHealth() {
        this.#health = this.#maxHealth;
    }

    #resetMana() {
        this.#mana = this.#maxMana;
    }

    #updateMana() {
        this.#maxMana = this.#baseMana + this.iq * this.#mpPerIqPoint + this.level * this.#mpPerLvl;
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
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: 'Welcome to Metin2 JS - An Open Source Project',
        });
    }

    showOtherEntity({
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
        this.publish(
            OtherCharacterSpawnedEvent.type,
            new OtherCharacterSpawnedEvent({
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
            }),
        );
    }

    hideOtherEntity({ virtualId }) {
        this.publish(OtherCharacterLeftGameEvent.type, new OtherCharacterLeftGameEvent({ virtualId }));
    }

    otherEntityLevelUp({ virtualId, level }) {
        this.publish(OtherCharacterLevelUpEvent.type, new OtherCharacterLevelUpEvent({ virtualId, level }));
    }

    otherEntityUpdated({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId }) {
        this.publish(
            OtherCharacterUpdatedEvent.type,
            new OtherCharacterUpdatedEvent({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId }),
        );
    }

    logout() {
        this.publish(LogoutEvent.type, new LogoutEvent());
    }

    chat({ message, messageType }) {
        this.publish(
            ChatEvent.type,
            new ChatEvent({
                message,
                messageType,
            }),
        );
    }

    sendCommandErrors(errors) {
        errors.forEach(({ errors }) => {
            errors.forEach(({ error }) => {
                this.chat({
                    message: error,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            });
        });
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

    updateView() {
        this.publish(
            CharacterUpdatedEvent.type,
            new CharacterUpdatedEvent({
                name: this.name,
                attackSpeed: this.attackSpeed,
                moveSpeed: this.movementSpeed,
                vid: this.virtualId,
                positionX: this.positionX,
                positionY: this.positionY,
                bodyId: this.getBody()?.id ?? 0,
                weaponId: this.getWeapon()?.id ?? 0,
                hairId: this.getHair()?.id ?? 0,
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
    }

    sync({ positionX, positionY, arg, rotation, time, movementType }) {
        //remove invisible and cancel other things like mining
        this.rotation = rotation;
        this.move(positionX, positionY);
        this.publish(
            CharacterMovedEvent.type,
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
    }

    #calcPlayTime() {
        return this.#playTime + Math.round((performance.now() - this.#lastPlayTime) / (1000 * 60));
    }

    get antiFlagClass() {
        switch (this.#playerClass) {
            case 0:
            case 4:
                return ItemAntiFlagEnum.ANTI_MUSA;
            case 1:
            case 5:
                return ItemAntiFlagEnum.ANTI_ASSASSIN;
            case 2:
            case 6:
                return ItemAntiFlagEnum.ANTI_SURA;
            case 3:
            case 7:
                return ItemAntiFlagEnum.ANTI_MUDANG;
            default:
                return 0;
        }
    }

    get antiFlagGender() {
        switch (this.#playerClass) {
            case 0:
            case 2:
            case 5:
            case 7:
                return ItemAntiFlagEnum.ANTI_MALE;
            case 1:
            case 3:
            case 4:
            case 6:
                return ItemAntiFlagEnum.ANTI_FEMALE;
            default:
                return 0;
        }
    }

    /* 
        ITEM MANAGEMENT
    */

    sendItemAdded({ window, position, item }) {
        return this.#playerInventory.sendItemAdded({ window, position, item });
    }

    sendItemRemoved({ window, position }) {
        return this.#playerInventory.sendItemRemoved({ window, position });
    }

    getItem(position) {
        return this.#playerInventory.getItem(position);
    }

    isWearable(item) {
        return this.#playerInventory.isWearable(item);
    }

    moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ }) {
        return this.#playerInventory.moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ });
    }

    addItem(item) {
        return this.#playerInventory.addItem(item);
    }

    sendInventory() {
        return this.#playerInventory.sendInventory();
    }

    dropItem({ item, count }) {
        return this.#playerInventory.dropItem({ item, count });
    }

    showDroppedItem({ virtualId, count, positionX, positionY, ownerName, id }) {
        return this.#playerInventory.showDroppedItem({ virtualId, count, positionX, positionY, ownerName, id });
    }

    hideDroppedItem({ virtualId }) {
        return this.#playerInventory.hideDroppedItem({ virtualId });
    }

    getBody() {
        return this.#playerInventory.getBody();
    }

    getWeapon() {
        return this.#playerInventory.getWeapon();
    }

    getHair() {
        return this.#playerInventory.getHair();
    }

    /* 
        AOI MANAGEMENT 
    */

    addNearbyEntity(entity) {
        super.addNearbyEntity(entity);
        this.onNearbyEntityAdded(entity);
    }

    removeNearbyEntity(entity) {
        super.removeNearbyEntity(entity);
        this.onNearbyEntityRemoved(entity);
    }

    onNearbyEntityAdded(otherEntity) {
        if (otherEntity instanceof GameEntity) {
            this.showOtherEntity({
                virtualId: otherEntity.virtualId,
                playerClass: otherEntity.classId,
                entityType: otherEntity.entityType,
                attackSpeed: otherEntity.attackSpeed,
                movementSpeed: otherEntity.movementSpeed,
                positionX: otherEntity.positionX,
                positionY: otherEntity.positionY,
                empireId: otherEntity.empireId,
                level: otherEntity.level,
                name: otherEntity.name,
                rotation: otherEntity.rotation,
            });

            if (otherEntity instanceof Player) {
                this.otherEntityUpdated({
                    vid: otherEntity.virtualId,
                    attackSpeed: otherEntity.attackSpeed,
                    moveSpeed: otherEntity.movementSpeed,
                    bodyId: otherEntity.getBody()?.id ?? 0,
                    weaponId: otherEntity.getWeapon()?.id ?? 0,
                    hairId: otherEntity.getHair()?.id ?? 0,
                });
            }
        }

        if (otherEntity instanceof DroppedItem) {
            this.showDroppedItem({
                virtualId: otherEntity.virtualId,
                count: otherEntity.count,
                ownerName: otherEntity.ownerName,
                positionX: otherEntity.positionX,
                positionY: otherEntity.positionY,
                id: otherEntity.item.id,
            });
        }
    }

    onNearbyEntityRemoved(otherEntity) {
        if (otherEntity instanceof GameEntity) {
            this.hideOtherEntity({ virtualId: otherEntity.virtualId });
        }

        if (otherEntity instanceof DroppedItem) {
            this.hideDroppedItem({ virtualId: otherEntity.virtualId });
        }
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
            defensePerHtPoint,
            attackPerStPoint,
            attackPerDXPoint,
            attackPerIQPoint,
        },
        { animationManager, config, experienceManager, logger },
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
                defensePerHtPoint,
                attackPerStPoint,
                attackPerDXPoint,
                attackPerIQPoint,
            },
            { animationManager, config, experienceManager, logger },
        );
    }

    toDatabase() {
        return new PlayerDTO({
            id: this.id,
            accountId: this.#accountId,
            empire: this.empire,
            playerClass: this.#playerClass,
            skillGroup: this.#skillGroup,
            playTime: this.#calcPlayTime(),
            level: this.level,
            experience: this.#experience,
            gold: this.#gold,
            st: this.st,
            ht: this.ht,
            dx: this.dx,
            iq: this.iq,
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.#health,
            mana: this.#mana,
            stamina: this.#stamina,
            bodyPart: this.getBody()?.id ?? 0,
            hairPart: this.getHair()?.id ?? 0,
            name: this.name,
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
    get playerClass() {
        return this.#playerClass;
    }
    get skillGroup() {
        return this.#skillGroup;
    }
    get playTime() {
        return this.#playTime;
    }
    get experience() {
        return this.#experience;
    }
    get gold() {
        return this.#gold;
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
    get givenStatusPoints() {
        return this.#givenStatusPoints;
    }
    get availableStatusPoints() {
        return this.#availableStatusPoints;
    }
    get slot() {
        return this.#slot;
    }
    get inventory() {
        return this.#inventory;
    }
}
