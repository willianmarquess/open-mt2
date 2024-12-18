import GameEntity from '../GameEntity';
import MonsterGroup from './MonsterGroup';

enum MobSizeEnum {
    RESERVED = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

enum MobResistTypeEnum {
    SWORD = 1,
    TWO_HAND = 2,
    DAGGER = 3,
    BELL = 4,
    FAN = 5,
    BOW = 6,
    FIRE = 7,
    ELECT = 8,
    MAGIC = 9,
    WIND = 10,
    POISON = 11,
}

class MobResist {
    private type: MobResistTypeEnum;

    constructor({ type }) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
}

class MobEnchant {
    private type;

    constructor({ type }) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
}

class MobSkill {
    private id;
    private level;

    constructor({ id, level }) {
        this.id = id;
        this.level = level;
    }

    getId() {
        return this.id;
    }
    getLevel() {
        return this.level;
    }
}

export default abstract class Mob extends GameEntity {
    protected rank: string;
    protected battleType: string;
    protected size: MobSizeEnum = MobSizeEnum.MEDIUM;
    protected aiFlag: string;
    protected mountCapacity: number;
    protected raceFlag: string;
    protected immuneFlag: string;
    protected folder: string;
    protected onClick: number;
    protected damageMin: number;
    protected damageMax: number;
    protected maxHp: number;
    protected regenCycle: number;
    protected regenPercent: number;
    protected goldMin: number;
    protected goldMax: number;
    protected exp: number;
    protected def: number;
    protected aggressiveHpPct: number;
    protected aggressiveSight: number;
    protected attackRange: number;
    protected dropItem: number;
    protected resurrectionId: number;
    protected direction: number;

    protected resists = [];
    protected enchants = [];
    protected skills = [];

    protected damMultiply: number;
    protected summon: number;
    protected drainSp: number;
    protected mobColor: number;
    protected polymorphItem: number;

    protected hpPercentToGetBerserk: number;
    protected hpPercentToGetStoneSkin: number;
    protected hpPercentToGetGodspeed: number;
    protected hpPercentToGetDeathblow: number;
    protected hpPercentToGetRevive: number;

    protected group: MonsterGroup;

    constructor(
        {
            id,
            virtualId,
            entityType,
            positionX,
            positionY,
            name,
            rank,
            battleType,
            level,
            size,
            aiFlag,
            mountCapacity,
            raceFlag,
            immuneFlag,
            empire,
            folder,
            onClick,
            st,
            dx,
            ht,
            iq,
            damageMin,
            damageMax,
            maxHp,
            regenCycle,
            regenPercent,
            goldMin,
            goldMax,
            exp,
            def,
            attackSpeed,
            movementSpeed,
            aggressiveHpPct,
            aggressiveSight,
            attackRange,
            dropItem,
            resurrectionId,
            damMultiply,
            summon,
            drainSp,
            mobColor,
            polymorphItem,
            hpPercentToGetBerserk,
            hpPercentToGetStoneSkin,
            hpPercentToGetGodspeed,
            hpPercentToGetDeathblow,
            hpPercentToGetRevive,
            direction,
        },
        { animationManager },
    ) {
        super(
            {
                id,
                classId: id,
                virtualId,
                entityType,
                positionX,
                positionY,
                movementSpeed,
                attackSpeed,
                dx,
                ht,
                iq,
                st,
                name,
                level,
                empire,
            },
            { animationManager },
        );
        this.rank = rank;
        this.battleType = battleType;
        this.size = size;
        this.aiFlag = aiFlag;
        this.mountCapacity = mountCapacity;
        this.raceFlag = raceFlag;
        this.immuneFlag = immuneFlag;
        this.folder = folder;
        this.onClick = onClick;
        this.damageMin = damageMin;
        this.damageMax = damageMax;
        this.maxHp = maxHp;
        this.regenCycle = regenCycle;
        this.regenPercent = regenPercent;
        this.goldMin = goldMin;
        this.goldMax = goldMax;
        this.exp = exp;
        this.def = def;
        this.aggressiveHpPct = aggressiveHpPct;
        this.aggressiveSight = aggressiveSight;
        this.attackRange = attackRange;
        this.dropItem = dropItem;
        this.resurrectionId = resurrectionId;
        this.damMultiply = damMultiply;
        this.summon = summon;
        this.drainSp = drainSp;
        this.mobColor = mobColor;
        this.polymorphItem = polymorphItem;
        this.hpPercentToGetBerserk = hpPercentToGetBerserk;
        this.hpPercentToGetStoneSkin = hpPercentToGetStoneSkin;
        this.hpPercentToGetGodspeed = hpPercentToGetGodspeed;
        this.hpPercentToGetDeathblow = hpPercentToGetDeathblow;
        this.hpPercentToGetRevive = hpPercentToGetRevive;
        this.direction = direction;
    }

    addResist(type) {
        this.resists.push(new MobResist({ type }));
    }

    addEnchant(type) {
        this.enchants.push(new MobEnchant({ type }));
    }

    addSkill(id, level) {
        this.skills.push(new MobSkill({ id, level }));
    }

    getRank() {
        return this.rank;
    }
    getBattleType() {
        return this.battleType;
    }
    getSize() {
        return this.size;
    }
    getAiFlag() {
        return this.aiFlag;
    }
    getMountCapacity() {
        return this.mountCapacity;
    }
    getRaceFlag() {
        return this.raceFlag;
    }
    getImmuneFlag() {
        return this.immuneFlag;
    }
    getFolder() {
        return this.folder;
    }
    getOnClick() {
        return this.onClick;
    }
    getDamageMin() {
        return this.damageMin;
    }
    getDamageMax() {
        return this.damageMax;
    }
    getMaxHp() {
        return this.maxHp;
    }
    getRegenCycle() {
        return this.regenCycle;
    }
    getRegenPercent() {
        return this.regenPercent;
    }
    getGoldMin() {
        return this.goldMin;
    }
    getGoldMax() {
        return this.goldMax;
    }
    getExp() {
        return this.exp;
    }
    getDef() {
        return this.def;
    }
    getAggressiveHpPct() {
        return this.aggressiveHpPct;
    }
    getAggressiveSight() {
        return this.aggressiveSight;
    }
    getAttackRange() {
        return this.attackRange;
    }
    getDropItem() {
        return this.dropItem;
    }
    getResurrectionId() {
        return this.resurrectionId;
    }
    getResists() {
        return this.resists;
    }
    getEnchants() {
        return this.enchants;
    }
    getSkills() {
        return this.skills;
    }
    getDamMultiply() {
        return this.damMultiply;
    }
    getSummon() {
        return this.summon;
    }
    getDrainSp() {
        return this.drainSp;
    }
    getMobColor() {
        return this.mobColor;
    }
    getPolymorphItem() {
        return this.polymorphItem;
    }
    getHpPercentToGetBerserk() {
        return this.hpPercentToGetBerserk;
    }
    getHpPercentToGetStoneSkin() {
        return this.hpPercentToGetStoneSkin;
    }
    getHpPercentToGetGodspeed() {
        return this.hpPercentToGetGodspeed;
    }
    getHpPercentToGetDeathblow() {
        return this.hpPercentToGetDeathblow;
    }
    getHpPercentToGetRevive() {
        return this.hpPercentToGetRevive;
    }
    getDirection() {
        return this.direction;
    }

    getGroup() {
        return this.group;
    }

    setGroup(value: MonsterGroup) {
        this.group = value;
    }
}
