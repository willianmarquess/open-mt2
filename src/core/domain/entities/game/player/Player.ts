import GameEntity from '@/core/domain/entities/game/GameEntity';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';
import Inventory from '../inventory/Inventory';
import InventoryEventsEnum from '../inventory/events/InventoryEventsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PlayerApplies from './delegate/PlayerApplies';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import JobUtil from '@/core/domain/util/JobUtil';
import CharacterMovedEvent from './events/CharacterMovedEvent';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import Item from '../item/Item';
import DropItemEvent from './events/DropItemEvent';
import DroppedItem from '../item/DroppedItem';
import { StatsEnum } from '@/core/enum/StatsEnum';
import PlayerState from '../../state/player/PlayerState';
import Character from '../Character';
import { SpecialItemEnum } from '@/core/enum/SpecialItemEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import CharacterUpdatedEvent from '../shared/event/CharacterUpdatedEvent';
import GameConnection from '@/game/interface/networking/GameConnection';
import ChatOutPacket from '@/core/interface/networking/packets/packet/out/ChatOutPacket';
import DamagePacket from '@/core/interface/networking/packets/packet/out/DamagePacket';
import TargetUpdatedPacket from '@/core/interface/networking/packets/packet/out/TargetUpdatePacket';
import CharacterSpawnPacket from '@/core/interface/networking/packets/packet/out/CharacterSpawnPacket';
import CharacterInfoPacket from '@/core/interface/networking/packets/packet/out/CharacterInfoPacket';
import CharacterUpdatePacket from '@/core/interface/networking/packets/packet/out/CharacterUpdatePacket';
import CharacterPointsPacket from '@/core/interface/networking/packets/packet/out/CharacterPointsPacket';
import CharacterDetailsPacket from '@/core/interface/networking/packets/packet/out/CharacterDetailsPacket';
import CharacterDiedPacket from '@/core/interface/networking/packets/packet/out/CharacterDiedPacket';
import TeleportPacket from '@/core/interface/networking/packets/packet/out/TeleportPacket';
import Ip from '@/core/util/Ip';
import CharacterPointChangePacket from '@/core/interface/networking/packets/packet/out/CharacterPointChangePacket';
import RemoveCharacterPacket from '@/core/interface/networking/packets/packet/out/RemoveCharacterPacket';
import ItemDroppedPacket from '@/core/interface/networking/packets/packet/out/ItemDroppedPacket';
import SetItemOwnershipPacket from '@/core/interface/networking/packets/packet/out/SetItemOwnershipPacket';
import ItemDroppedHidePacket from '@/core/interface/networking/packets/packet/out/ItemDroppedHidePacket';
import ItemPacket from '@/core/interface/networking/packets/packet/out/ItemPacket';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import { ItemEquipmentSlotEnum } from '@/core/enum/ItemEquipmentSlotEnum';
import FlyPacket from '@/core/interface/networking/packets/packet/out/FlyPacket';
import CharacterMoveOutPacket from '@/core/interface/networking/packets/packet/out/CharacterMoveOutPacket';
import AffectAddPacket from '@/core/interface/networking/packets/packet/out/AffectAddPacket';

const REGEN_INTERVAL = 3000;

export default class Player extends Character {
    private readonly accountId: number;
    private readonly playerClass: number;
    private skillGroup: number;
    private readonly playTime: number;
    private experience: number;
    private gold: number;
    private stamina: number;
    private bodyPart: number;
    private hairPart: number;
    private givenStatusPoints: number;
    private availableStatusPoints: number;
    private slot: number;

    private appearance: number;

    private health: number;
    private baseHealth: number;
    private hpPerLvl: number;
    private hpPerHtPoint: number;
    private mana: number;
    private mpPerLvl: number;
    private mpPerIqPoint: number;
    private baseMana: number;

    private experienceManager: ExperienceManager;
    private config: GameConfig;

    //in game points
    private defense: number = 0;
    private defensePerHtPoint: number = 0;
    private attackValue: number = 0;
    private attackBonus: number = 0;
    private attackPerStPoint: number = 0;
    private attackPerDXPoint: number = 0;
    private attackPerIQPoint: number = 0;
    private magicAttack: number = 0;
    private magicAttackBonus: number = 0;
    private magicDefense: number = 0;
    private magicDefenseBonus: number = 0;
    private healthRegenBonus: number = 0;
    private manaRegenBonus: number = 0;
    private poisonChance: number = 20;
    private slowChance: number = 20;
    private stunChance: number = 20;
    private criticalChance: number = 20;
    private penetrateChance: number = 20;
    private stealHealthPercentage: number = 20;
    private stealManaPercentage: number = 20;
    private stealGoldChance: number = 10;
    private healthHitRecoveryPercentage: number = 10;
    private manaHitRecoveryPercentage: number = 10;
    // movementSpeed;
    // neededExperience;
    // defenseGrade;
    // attackGrade;
    // statusPoints;
    // subSkill;
    // skill;
    // minAttackDamage;
    // maxAttackDamage;
    // penetratePercentage;
    private itemDropBonus: number = 0;
    // attackBonus;
    // defenseBonus;
    private mallItemBonus: number = 0;
    // magicAttackBonus;
    // resistCritical;
    // resistPenetrate;
    // minWeaponDamage;
    // maxWeaponDamage;

    private lastPlayTime: number = performance.now();
    private inventory: Inventory;

    //delegate
    private playerApplies: PlayerApplies;

    //connection
    private connection: GameConnection;

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
        this.accountId = accountId;
        this.playerClass = playerClass;
        this.skillGroup = skillGroup;
        this.playTime = playTime;
        this.experience = experience;
        this.gold = gold;
        this.health = health;
        this.mana = mana;
        this.stamina = stamina;
        this.bodyPart = bodyPart;
        this.hairPart = hairPart;
        this.givenStatusPoints = givenStatusPoints;
        this.availableStatusPoints = availableStatusPoints;
        this.slot = slot;
        this.appearance = appearance;

        //in game values
        this.hpPerLvl = hpPerLvl;
        this.hpPerHtPoint = hpPerHtPoint;
        this.mpPerLvl = mpPerLvl;
        this.mpPerIqPoint = mpPerIqPoint;
        this.baseMana = baseMana;
        this.baseHealth = baseHealth;
        this.defensePerHtPoint = defensePerHtPoint;
        this.attackPerStPoint = attackPerStPoint;
        this.attackPerDXPoint = attackPerDXPoint;
        this.attackPerIQPoint = attackPerIQPoint;
        this.experienceManager = experienceManager;
        this.config = config;
        this.inventory = new Inventory({ config: this.config, ownerId: this.id });
        this.inventory.subscribe(InventoryEventsEnum.ITEM_EQUIPPED, this.onItemEquipped.bind(this));
        this.inventory.subscribe(InventoryEventsEnum.ITEM_UNEQUIPPED, this.onItemUnequipped.bind(this));

        this.playerApplies = new PlayerApplies(this, logger);

        this.stateMachine
            .addState({
                name: EntityStateEnum.IDLE,
                onTick: this.idleStateTick.bind(this),
                onStart: this.idleStateStart.bind(this),
            })
            .addState({
                name: EntityStateEnum.MOVING,
                onTick: this.movingStateTick.bind(this),
            })
            .addState({
                name: EntityStateEnum.DEAD,
                onTick: this.deadStateTick.bind(this),
                onStart: this.deadStateStart.bind(this),
            })
            .gotoState(EntityStateEnum.IDLE);

        this.init();
    }

    setConnection(connection: GameConnection) {
        this.connection = connection;
    }

    sendDetails() {
        this.connection.send(
            new CharacterDetailsPacket({
                vid: this.getVirtualId(),
                playerClass: this.getPlayerClass(),
                playerName: this.getName(),
                skillGroup: this.getSkillGroup(),
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                positionZ: 0,
                empireId: this.getEmpire(),
            }),
        );
    }

    init() {
        this.updateHealth();
        this.resetHealth();
        this.updateMana();
        this.resetMana();
        this.updateDefense();
        this.updateAttack();

        this.points.set(PointsEnum.EXPERIENCE, () => this.experience);
        this.points.set(PointsEnum.HT, () => this.ht);
        this.points.set(PointsEnum.ST, () => this.st);
        this.points.set(PointsEnum.IQ, () => this.iq);
        this.points.set(PointsEnum.DX, () => this.dx);
        this.points.set(PointsEnum.LEVEL, () => this.level);
        this.points.set(PointsEnum.MAX_HEALTH, () => this.maxHealth);
        this.points.set(PointsEnum.MAX_MANA, () => this.maxMana);
        this.points.set(PointsEnum.HEALTH, () => this.health);
        this.points.set(PointsEnum.MANA, () => this.mana);
        this.points.set(PointsEnum.ATTACK_SPEED, () => this.attackSpeed);
        this.points.set(PointsEnum.MOVE_SPEED, () => this.movementSpeed);
        this.points.set(PointsEnum.NEEDED_EXPERIENCE, () => this.experienceManager.getNeededExperience(this.level));
        this.points.set(PointsEnum.STATUS_POINTS, () => this.availableStatusPoints);
        this.points.set(PointsEnum.GOLD, () => this.gold);
        this.points.set(PointsEnum.DEFENSE, () => this.defense);
        this.points.set(PointsEnum.DEFENSE_GRADE, () => this.defense);
        this.points.set(PointsEnum.ATTACK_GRADE, () => this.attackValue);
        this.points.set(PointsEnum.MAGIC_ATT_GRADE, () => this.magicAttack);
        this.points.set(PointsEnum.MAGIC_DEF_GRADE, () => this.magicDefense);
        this.points.set(PointsEnum.MALL_ITEM_BONUS, () => this.mallItemBonus);
        this.points.set(PointsEnum.ITEM_DROP_BONUS, () => this.itemDropBonus);
        this.points.set(PointsEnum.POISON, () => this.poisonChance);
        this.points.set(PointsEnum.SLOW, () => this.slowChance);
        this.points.set(PointsEnum.STUN, () => this.stunChance);
        this.points.set(PointsEnum.CRITICAL_PERCENTAGE, () => this.criticalChance);
        this.points.set(PointsEnum.PENETRATE_PERCENTAGE, () => this.penetrateChance);
        this.points.set(PointsEnum.STEAL_HEALTH, () => this.stealHealthPercentage);
        this.points.set(PointsEnum.STEAL_MANA, () => this.stealManaPercentage);
        this.points.set(PointsEnum.STEAL_GOLD, () => this.stealGoldChance);
        this.points.set(PointsEnum.HIT_HEALTH_RECOVERY, () => this.healthHitRecoveryPercentage);
        this.points.set(PointsEnum.HIT_MANA_RECOVERY, () => this.manaHitRecoveryPercentage);

        this.eventTimerManager.addTimer({
            id: 'REGEN_HEALTH',
            eventFunction: this.regenHealth.bind(this),
            options: { interval: REGEN_INTERVAL },
        });
        this.eventTimerManager.addTimer({
            id: 'REGEN_MANA',
            eventFunction: this.regenMana.bind(this),
            options: { interval: REGEN_INTERVAL },
        });
    }

    takeDamage(attacker: Character, damage: number): void {
        console.log(attacker.getName());
        this.health -= damage;

        if (this.health <= 0) {
            this.health = this.maxHealth;
            //TODO: player death
            return;
        }
    }

    otherEntityDied(entity: GameEntity) {
        this.connection.send(new CharacterDiedPacket({ virtualId: entity.getVirtualId() }));
    }

    getHealthPercentage() {
        return Math.round(Math.max(0, Math.min(100, (this.health * 100) / this.maxHealth)));
    }

    setTarget(target: Character) {
        super.setTarget(target);
        this.sendTargetUpdated(target);
    }

    sendTargetUpdated(target: Character) {
        this.connection.send(
            new TargetUpdatedPacket({
                virtualId: target.getVirtualId(),
                healthPercentage: target.getHealthPercentage(),
            }),
        );
    }

    sendDamageCaused({ virtualId, damage, damageFlags }) {
        this.connection.send(
            new DamagePacket({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    sendDamageReceived({ damage, damageFlags }) {
        this.connection.send(
            new DamagePacket({
                virtualId: this.virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    regenHealth() {
        if (this.state === EntityStateEnum.DEAD) return;
        if (this.health >= this.maxHealth) return;

        let percent = this.state === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.healthRegenBonus / 100);
        const amount = this.maxHealth * (percent / 100);
        this.addHealth(Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM][HP REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.sendPoints();
    }

    regenMana() {
        if (this.state === EntityStateEnum.DEAD) return;
        if (this.mana >= this.maxMana) return;

        let percent = this.state === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.manaRegenBonus / 100);
        const amount = this.maxMana * (percent / 100);
        this.addMana(Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM][MANA REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.sendPoints();
    }

    onEquipmentChange() {
        this.updateDefense();
        this.updateMagicDefense();
        this.updateAttack();
        this.updateHealth();
        this.updateMana();
        this.updateView();
        this.sendPoints();
    }

    onItemEquipped({ item }) {
        this.playerApplies.addItemApplies(item);
        this.onEquipmentChange();
    }

    onItemUnequipped({ item }) {
        this.playerApplies.removeItemApplies(item);
        this.onEquipmentChange();
    }

    getAttack() {
        let attack =
            this.level * 2 +
            this.attackPerStPoint * this.st +
            this.attackPerIQPoint * this.iq +
            this.attackPerDXPoint * this.dx;
        attack += this.attackBonus;
        const { physic } = this.inventory.getWeaponValues();
        attack += Math.floor(Math.random() * (physic.max - physic.min) + physic.min) * 2;
        attack += physic.bonus * 2;
        return Math.floor(attack);
    }

    getMagicAttack() {
        let magicAttack = this.level * 2 + 2 * this.iq;
        magicAttack += this.magicAttackBonus;
        const { magic } = this.inventory.getWeaponValues();
        magicAttack += Math.floor(Math.random() * (magic.max - magic.min) + magic.min) * 2;
        magicAttack += magic.bonus * 2;
        return Math.floor(magicAttack);
    }

    getDefense() {
        let defense = this.level + Math.floor(this.defensePerHtPoint * this.ht);
        const armorValues = this.inventory.getArmorValues();
        armorValues.forEach(({ flat, multi }) => {
            defense += flat;
            defense += multi * 2;
        });
        return Math.floor(defense);
    }

    getMagicDefense() {
        let magicDefense = this.level + (this.iq * 3 + this.ht / 3 + this.getDefense() / 2);
        magicDefense += this.magicDefenseBonus;
        return Math.floor(magicDefense);
    }

    updateAttack() {
        this.attackValue = this.getAttack();
    }

    updateMagicAttack() {
        this.magicAttack = this.getMagicAttack();
    }

    updateDefense() {
        this.defense = this.getDefense();
    }

    updateMagicDefense() {
        this.magicDefense = this.getMagicDefense();
    }

    addStat(stat: StatsEnum, value = 1) {
        if (!['st', 'ht', 'dx', 'iq'].includes(stat)) return;
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue === 0 || validatedValue > this.availableStatusPoints) return;

        let realValue = 0;
        if (this[stat] + validatedValue > this.config.MAX_POINTS) {
            const diff = this.config.MAX_POINTS - this[stat];
            realValue = diff;
        } else {
            realValue = validatedValue;
        }

        this[stat] += realValue;
        this.givenStatusPoints += realValue;
        this.availableStatusPoints -= realValue;

        switch (stat) {
            case StatsEnum.ST:
                this.updateAttack();
                this.sendPoints();
                break;
            case StatsEnum.HT:
                this.updateDefense();
                this.updateMagicDefense();
                this.updateHealth();
                this.sendPoints();
                break;
            case StatsEnum.DX:
                this.updateAttack();
                this.sendPoints();
                break;
            case StatsEnum.IQ:
                this.updateAttack();
                this.updateMagicAttack();
                this.updateMagicDefense();
                this.updateMana();
                break;
        }

        this.sendPoints();
    }

    updateStatusPoints() {
        const baseStatusPoints = (this.level - 1) * this.config.POINTS_PER_LEVEL;

        const expNeeded = this.experienceManager.getNeededExperience(this.level);
        const experienceRatio = this.experience / expNeeded;

        const totalStatusPoints = Math.floor(baseStatusPoints + experienceRatio * 4);

        const excessPoints = this.givenStatusPoints - totalStatusPoints;
        this.availableStatusPoints -= Math.min(excessPoints, this.availableStatusPoints);

        this.givenStatusPoints -= excessPoints;
        this.availableStatusPoints += totalStatusPoints - this.givenStatusPoints;
        this.givenStatusPoints = totalStatusPoints;
    }

    teleport(x: number, y: number) {
        this.move(x, y);
        this.stop();

        this.connection.send(
            new TeleportPacket({
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                port: Number(this.config.SERVER_PORT),
                address: Ip.toInt(this.config.SERVER_ADDRESS),
            }),
        );
    }

    addGold(value: number = 1) {
        const validatedValue = MathUtil.toNumber(value);
        if (validatedValue === 0) return;

        this.gold = Math.min(this.gold + validatedValue, MathUtil.MAX_UINT);
        this.sendPoints();
    }

    addExperience(value: number) {
        const validatedValue = MathUtil.toUnsignedNumber(value);

        if (validatedValue < 0 || (this.level >= this.config.MAX_LEVEL && this.experience === 0)) return;

        if (this.level >= this.config.MAX_LEVEL) {
            this.experience = 0;
            this.updateStatusPoints();
            this.sendPoints();
            return;
        }

        const expNeeded = this.experienceManager.getNeededExperience(this.level);

        if (this.experience + validatedValue >= expNeeded) {
            const diff = this.experience + validatedValue - expNeeded;
            this.experience = diff;
            this.addLevel(1);
            this.updateStatusPoints();
            this.addExperience(0);
            return;
        }

        const expPart = expNeeded / 4;
        const before = this.experience;
        this.experience += validatedValue;

        const beforePart = before / expPart;
        const afterPart = this.experience / expPart;
        const expSteps = Math.floor(afterPart) - Math.floor(beforePart);

        if (expSteps > 0) {
            this.health = this.maxHealth;
            this.mana = this.maxMana;
            this.updateStatusPoints();
        }
        this.sendPoints();
    }

    addLevel(value: number) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (this.level + validatedValue > this.config.MAX_LEVEL) return;
        if (validatedValue < 1) return;

        //add skill point
        this.level += validatedValue;
        this.updateHealth();
        this.resetHealth();
        this.updateMana();
        this.resetMana();
        this.updateStatusPoints();
        this.updateAttack();
        this.updateMagicAttack();
        this.updateDefense();
        this.sendPoints();

        //verify if we really need to send this
        this.connection.send(
            new CharacterPointChangePacket({
                vid: this.virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: this.level,
            }),
        );
    }

    setLevel(value: number = 1) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue < 1 || validatedValue > this.config.MAX_LEVEL) return;

        this.level = validatedValue;
        //reset skills

        this.givenStatusPoints = 0;
        this.availableStatusPoints = 0;
        this.experience = 0;
        const className = JobUtil.getClassNameFromClassId(this.playerClass);
        this.st = this.config.jobs[className].common.st;
        this.ht = this.config.jobs[className].common.ht;
        this.dx = this.config.jobs[className].common.dx;
        this.iq = this.config.jobs[className].common.iq;

        this.updateHealth();
        this.resetHealth();
        this.updateMana();
        this.resetMana();
        this.updateStatusPoints();
        this.updateAttack();
        this.updateDefense();
        this.sendPoints();

        //add skill point
        //verify if we really need to send this
        this.connection.send(
            new CharacterPointChangePacket({
                vid: this.virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: this.level,
            }),
        );
    }

    addHealthRegen(value: number) {
        const validatedValue = Math.min(this.healthRegenBonus + value, MathUtil.MAX_UINT);
        this.healthRegenBonus += validatedValue;
    }

    addManaRegen(value: number) {
        const validatedValue = Math.min(this.manaRegenBonus + value, MathUtil.MAX_UINT);
        this.manaRegenBonus = validatedValue;
    }

    addMovementSpeed(value: number) {
        const validatedValue = Math.min(this.movementSpeed + value, MathUtil.MAX_TINY);
        this.movementSpeed = validatedValue;
    }

    addAttackSpeed(value: number) {
        const validatedValue = Math.min(this.attackSpeed + value, MathUtil.MAX_TINY);
        this.attackSpeed = validatedValue;
    }

    addMana(value: number) {
        this.mana = Math.min(this.mana + Math.max(value, 0), this.maxMana);
    }

    addMaxMana(value: number) {
        this.maxMana += MathUtil.toUnsignedNumber(value);
    }

    addHealth(value: number) {
        this.health = Math.min(this.health + Math.max(value, 0), this.maxHealth);
    }

    addMaxHealth(value: number) {
        this.maxHealth += MathUtil.toUnsignedNumber(value);
    }

    updateHealth() {
        this.maxHealth = this.baseHealth + this.ht * this.hpPerHtPoint + this.level * this.hpPerLvl;
    }

    resetHealth() {
        this.health = this.maxHealth;
    }

    resetMana() {
        this.mana = this.maxMana;
    }

    updateMana() {
        this.maxMana = this.baseMana + this.iq * this.mpPerIqPoint + this.level * this.mpPerLvl;
    }

    private showEntity({
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
        this.connection.send(
            new CharacterSpawnPacket({
                vid: virtualId,
                playerClass,
                entityType,
                attackSpeed,
                movementSpeed,
                positionX,
                positionY,
                positionZ: 0,
                rotation,
            }),
        );

        this.connection.send(
            new CharacterInfoPacket({
                vid: virtualId,
                empireId,
                level,
                playerName: name,
                guildId: 0, //todo
                mountId: 0, //todo
                pkMode: 0, //todo
                rankPoints: 0, //todo
            }),
        );
    }

    spawn() {
        this.lastPlayTime = performance.now();

        this.showEntity({
            virtualId: this.getVirtualId(),
            playerClass: this.getPlayerClass(),
            entityType: this.getEntityType(),
            attackSpeed: this.getAttackSpeed(),
            movementSpeed: this.getMovementSpeed(),
            positionX: this.getPositionX(),
            positionY: this.getPositionY(),
            empireId: this.getEmpire(),
            level: this.getLevel(),
            name: this.getName(),
            rotation: this.getRotation(),
        });

        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] Welcome to Open Metin2 - An Open Source Project',
        });
    }

    private showOtherEntity({
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
        this.showEntity({
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
        });
    }

    hideOtherEntity({ virtualId }) {
        this.connection.send(
            new RemoveCharacterPacket({
                vid: virtualId,
            }),
        );
    }

    otherEntityLevelUp({ virtualId, level }) {
        this.connection.send(
            new CharacterPointChangePacket({
                vid: virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: level,
            }),
        );
    }

    otherEntityUpdated({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId, affects }) {
        this.connection.send(
            new CharacterUpdatePacket({
                vid,
                attackSpeed,
                moveSpeed,
                parts: [bodyId, weaponId, 0, hairId],
                affects,
            }),
        );
    }

    logout() {
        this.chat({
            message: '[SYSTEM] Leaving game',
            messageType: ChatMessageTypeEnum.INFO,
        });
        setTimeout(() => this.connection.close(), 1_000);
    }

    chat({ message, messageType }: { message: string; messageType: ChatMessageTypeEnum }) {
        this.connection.send(
            new ChatOutPacket({
                messageType,
                message,
                vid: this.getVirtualId(),
                empireId: this.getEmpire(),
            }),
        );
    }

    sendCommandErrors(errors: Array<any>) {
        errors.forEach(({ errors }) => {
            errors.forEach(({ error }) => {
                this.chat({
                    message: `[SYSTEM] ${error}`,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            });
        });
    }

    sendPoints() {
        const characterPointsPacket = new CharacterPointsPacket();
        for (const point of this.getPoints().keys()) {
            characterPointsPacket.addPoint(Number(point), this.getPoint(point));
        }
        this.connection.send(characterPointsPacket);
    }

    updateOtherEntity({ virtualId, arg, movementType, time, rotation, positionX, positionY, duration }) {
        this.connection.send(
            new CharacterMoveOutPacket({
                vid: virtualId,
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

    sendAffect({ type, apply, duration, flag, value, manaCost }) {
        this.connection.send(
            new AffectAddPacket({
                type,
                apply,
                duration,
                flag,
                value,
                manaCost,
            }),
        );
    }

    updateView() {
        this.connection.send(
            new CharacterUpdatePacket({
                vid: this.virtualId,
                attackSpeed: this.attackSpeed,
                moveSpeed: this.movementSpeed,
                parts: [this.getBody()?.getId() ?? 0, this.getWeapon()?.getId() ?? 0, 0, this.getHair()?.getId() ?? 0],
                affects: this.getAffectFlags(),
            }),
        );

        this.area?.onCharacterUpdate(
            new CharacterUpdatedEvent({
                name: this.name,
                attackSpeed: this.attackSpeed,
                moveSpeed: this.movementSpeed,
                vid: this.virtualId,
                positionX: this.positionX,
                positionY: this.positionY,
                bodyId: this.getBody()?.getId() ?? 0,
                weaponId: this.getWeapon()?.getId() ?? 0,
                hairId: this.getHair()?.getId() ?? 0,
                affects: this.getAffectFlags(),
            }),
        );
    }

    wait({ positionX, positionY, arg, rotation, time, movementType }) {
        super.waitInternal(positionX, positionY);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
    }

    goto({ positionX, positionY, arg, rotation, time, movementType }) {
        super.gotoInternal(positionX, positionY, rotation);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: this.movementDuration },
                entity: this,
            }),
        );
    }

    move(x: number, y: number) {
        super.move(x, y);
    }

    sync({ positionX, positionY, arg, rotation, time, movementType }) {
        //remove invisible and cancel other things like mining
        this.rotation = rotation;
        this.move(positionX, positionY);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
    }

    calcPlayTime() {
        return this.playTime + Math.round((performance.now() - this.lastPlayTime) / (1000 * 60));
    }

    get antiFlagClass() {
        switch (this.playerClass) {
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
        switch (this.playerClass) {
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

    isEquippedWithUniqueItem(uniqueItemId: SpecialItemEnum): boolean {
        const uniqueItem1 = this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.UNIQUE1);
        const uniqueItem2 = this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.UNIQUE1);

        return uniqueItem1?.getId() === uniqueItemId || uniqueItem2?.getId() === uniqueItemId;
    }

    sendItemAdded({ window, position, item }) {
        this.connection.send(
            new ItemPacket({
                window,
                position,
                id: item.getId(),
                count: item.getCount() ?? 1,
                flags: item.getFlags().getFlag(),
                antiFlags: item.getAntiFlags().getFlag(),
                highlight: 0, //todo
                bonuses: [], //todo
                sockets: [], //todo
            }),
        );
    }

    sendItemRemoved({ window, position }) {
        this.connection.send(
            new ItemPacket({
                window,
                position,
                id: 0,
                count: 0,
                flags: 0,
                antiFlags: 0,
                highlight: 0,
            }),
        );
    }

    getItem(position: number) {
        return this.inventory.getItem(Number(position));
    }

    isWearable(item: Item) {
        return (
            this.getLevel() >= item.getLevelLimit() &&
            item.getWearFlags().getFlag() > 0 &&
            !item.getAntiFlags().is(this.antiFlagClass) &&
            !item.getAntiFlags().is(this.antiFlagGender)
        );
    }

    moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ }) {
        const item = this.getItem(fromPosition);

        if (!item) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!this.getInventory().isValidPosition(toPosition)) return;
        if (!this.getInventory().haveAvailablePosition(toPosition, item.getSize())) return;

        if (this.getInventory().isEquipmentPosition(toPosition)) {
            if (!this.isWearable(item)) return;
            if (!this.getInventory().isValidSlot(item, toPosition)) return;
        }

        this.getInventory().removeItem(fromPosition, item.getSize());
        this.getInventory().addItemAt(item, toPosition);

        this.sendItemRemoved({
            window: fromWindow,
            position: fromPosition,
        });
        this.sendItemAdded({ window: toWindow, position: toPosition, item });

        return item;
    }

    addItem(item: Item): boolean {
        const position = this.getInventory().addItem(item);

        if (position < 0) {
            this.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Inventory is full',
            });
            return false;
        }

        this.sendItemAdded({ window: WindowTypeEnum.INVENTORY, position, item });

        return true;
    }

    addItems(items: Array<Item>) {
        for (const item of items) {
            this.inventory.addItemAt(item, item.getPosition());
        }
        this.sendPoints();
    }

    sendInventory() {
        for (const item of this.getInventory().getItems().values()) {
            this.sendItemAdded({ window: item.getWindow(), position: item.getPosition(), item });
        }
        this.updateView();
    }

    dropItem({ item, count }) {
        this.area.onItemDrop(
            new DropItemEvent({
                item,
                count,
                positionX: this.positionX,
                positionY: this.positionY,
                ownerName: this.name,
            }),
        );
    }

    showDroppedItem({ virtualId, positionX, positionY, ownerName, id }) {
        this.connection.send(
            new ItemDroppedPacket({
                id,
                positionX,
                positionY,
                virtualId,
            }),
        );

        this.connection.send(
            new SetItemOwnershipPacket({
                ownerName,
                virtualId,
            }),
        );
    }

    hideDroppedItem({ virtualId }) {
        this.connection.send(
            new ItemDroppedHidePacket({
                virtualId,
            }),
        );
    }

    getBody() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.BODY);
    }

    getWeapon() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.WEAPON);
    }

    getHair() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR);
    }

    /* 
        AOI MANAGEMENT 
    */

    addNearbyEntity(entity: GameEntity) {
        super.addNearbyEntity(entity);
        this.onNearbyEntityAdded(entity);
    }

    removeNearbyEntity(entity: GameEntity) {
        super.removeNearbyEntity(entity);
        this.onNearbyEntityRemoved(entity);
    }

    onNearbyEntityAdded(otherEntity: GameEntity) {
        if (otherEntity instanceof Character) {
            this.showOtherEntity({
                virtualId: otherEntity.getVirtualId(),
                playerClass: otherEntity.getClassId(),
                entityType: otherEntity.getEntityType(),
                attackSpeed: otherEntity.getAttackSpeed(),
                movementSpeed: otherEntity.getMovementSpeed(),
                positionX: otherEntity.getPositionX(),
                positionY: otherEntity.getPositionY(),
                empireId: otherEntity.getEmpire(),
                level: otherEntity.getLevel(),
                name: otherEntity.getName(),
                rotation: otherEntity.getRotation(),
            });

            if (otherEntity instanceof Player) {
                this.otherEntityUpdated({
                    vid: otherEntity.virtualId,
                    attackSpeed: otherEntity.attackSpeed,
                    moveSpeed: otherEntity.movementSpeed,
                    bodyId: otherEntity.getBody()?.getId() ?? 0,
                    weaponId: otherEntity.getWeapon()?.getId() ?? 0,
                    hairId: otherEntity.getHair()?.getId() ?? 0,
                    affects: otherEntity.getAffectFlags(),
                });
            }
        }

        if (otherEntity instanceof DroppedItem) {
            this.showDroppedItem({
                virtualId: otherEntity.getVirtualId(),
                // count: otherEntity.getCount(),
                ownerName: otherEntity.getOwnerName(),
                positionX: otherEntity.getPositionX(),
                positionY: otherEntity.getPositionY(),
                id: otherEntity.getItem().getId(),
            });
        }
    }

    onNearbyEntityRemoved(otherEntity: GameEntity) {
        if (otherEntity instanceof Character) {
            this.hideOtherEntity({ virtualId: otherEntity.getVirtualId() });
        }

        if (otherEntity instanceof DroppedItem) {
            this.hideDroppedItem({ virtualId: otherEntity.getVirtualId() });
        }
    }

    showFlyEffect(type: FlyEnum, from: number, to: number) {
        this.connection.send(
            new FlyPacket({
                fromVirtualId: from,
                toVirtualId: to,
                type,
            }),
        );
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
        return new PlayerState({
            id: this.id,
            accountId: this.accountId,
            empire: this.empire,
            playerClass: this.playerClass,
            skillGroup: this.skillGroup,
            playTime: this.calcPlayTime(),
            level: this.level,
            experience: this.experience,
            gold: this.gold,
            st: this.st,
            ht: this.ht,
            dx: this.dx,
            iq: this.iq,
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.health,
            mana: this.mana,
            stamina: this.stamina,
            bodyPart: this.getBody()?.getId() ?? 0,
            hairPart: this.getHair()?.getId() ?? 0,
            name: this.name,
            givenStatusPoints: this.givenStatusPoints,
            availableStatusPoints: this.availableStatusPoints,
            slot: this.slot,
        });
    }

    getAppearance() {
        return this.appearance;
    }
    getMaxHealth() {
        return this.maxHealth;
    }
    getMaxMana() {
        return this.maxMana;
    }
    getAccountId() {
        return this.accountId;
    }
    getPlayerClass() {
        return this.playerClass;
    }
    getSkillGroup() {
        return this.skillGroup;
    }
    getPlayTime() {
        return this.playTime;
    }
    getExperience() {
        return this.experience;
    }
    getGold() {
        return this.gold;
    }
    getHealth() {
        return this.health;
    }
    getMana() {
        return this.mana;
    }
    getStamina() {
        return this.stamina;
    }
    getBodyPart() {
        return this.bodyPart;
    }
    getHairPart() {
        return this.hairPart;
    }
    getGivenStatusPoints() {
        return this.givenStatusPoints;
    }
    getAvailableStatusPoints() {
        return this.availableStatusPoints;
    }
    getSlot() {
        return this.slot;
    }
    getInventory() {
        return this.inventory;
    }
    getMallItemBonus() {
        return this.mallItemBonus;
    }
    getItemDropBonus() {
        return this.itemDropBonus;
    }
    setPoisonChance(value: number) {
        this.poisonChance = value > 0 ? value : 0;
    }

    addPoisonChance(value: number) {
        this.poisonChance += value > 0 ? value : 0;
    }

    setStunChance(value: number) {
        this.stunChance = value > 0 ? value : 0;
    }

    addStunChance(value: number) {
        this.stunChance += value > 0 ? value : 0;
    }

    setSlowChance(value: number) {
        this.slowChance = value > 0 ? value : 0;
    }

    addSlowChance(value: number) {
        this.slowChance += value > 0 ? value : 0;
    }
}
