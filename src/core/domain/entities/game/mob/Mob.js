import GameEntity from '../GameEntity.js';

const MobSizeEnum = {
    RESERVED: 0,
    SMALL: 1,
    MEDIUM: 2,
    BIG: 3,
};

class MobResist {
    #type;

    constructor({ type }) {
        this.#type = type;
    }

    get type() {
        return this.#type;
    }
}

class MobEnchant {
    #type;

    constructor({ type }) {
        this.#type = type;
    }

    get type() {
        return this.#type;
    }
}

class MobSkill {
    #id;
    #level;

    constructor({ id, level }) {
        this.#id = id;
        this.#level = level;
    }

    get id() {
        return this.#id;
    }
    get level() {
        return this.#level;
    }
}

export default class Mob extends GameEntity {
    #rank;
    #battleType;
    #size = MobSizeEnum.MEDIUM;
    #aiFlag;
    #mountCapacity;
    #raceFlag;
    #immuneFlag;
    #folder;
    #onClick;
    #damageMin;
    #damageMax;
    #maxHp;
    #regenCycle;
    #regenPercent;
    #goldMin;
    #goldMax;
    #exp;
    #def;
    #aggressiveHpPct;
    #aggressiveSight;
    #attackRange;
    #dropItem;
    #resurrectionId;

    #resists = [];
    #enchants = [];
    #skills = [];

    #damMultiply;
    #summon;
    #drainSp;
    #mobColor;
    #polymorphItem;

    #hpPercentToGetBerserk;
    #hpPercentToGetStoneSkin;
    #hpPercentToGetGodspeed;
    #hpPercentToGetDeathblow;
    #hpPercentToGetRevive;

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
        this.#rank = rank;
        this.#battleType = battleType;
        this.#size = size;
        this.#aiFlag = aiFlag;
        this.#mountCapacity = mountCapacity;
        this.#raceFlag = raceFlag;
        this.#immuneFlag = immuneFlag;
        this.#folder = folder;
        this.#onClick = onClick;
        this.#damageMin = damageMin;
        this.#damageMax = damageMax;
        this.#maxHp = maxHp;
        this.#regenCycle = regenCycle;
        this.#regenPercent = regenPercent;
        this.#goldMin = goldMin;
        this.#goldMax = goldMax;
        this.#exp = exp;
        this.#def = def;
        this.#aggressiveHpPct = aggressiveHpPct;
        this.#aggressiveSight = aggressiveSight;
        this.#attackRange = attackRange;
        this.#dropItem = dropItem;
        this.#resurrectionId = resurrectionId;
        this.#damMultiply = damMultiply;
        this.#summon = summon;
        this.#drainSp = drainSp;
        this.#mobColor = mobColor;
        this.#polymorphItem = polymorphItem;
        this.#hpPercentToGetBerserk = hpPercentToGetBerserk;
        this.#hpPercentToGetStoneSkin = hpPercentToGetStoneSkin;
        this.#hpPercentToGetGodspeed = hpPercentToGetGodspeed;
        this.#hpPercentToGetDeathblow = hpPercentToGetDeathblow;
        this.#hpPercentToGetRevive = hpPercentToGetRevive;
    }

    addResist(type) {
        this.#resists.push(new MobResist({ type }));
    }

    addEnchant(type) {
        this.#enchants.push(new MobEnchant({ type }));
    }

    addSkill(id, level) {
        this.#skills.push(new MobSkill({ id, level }));
    }

    get rank() {
        return this.#rank;
    }
    get battleType() {
        return this.#battleType;
    }
    get size() {
        return this.#size;
    }
    get aiFlag() {
        return this.#aiFlag;
    }
    get mountCapacity() {
        return this.#mountCapacity;
    }
    get raceFlag() {
        return this.#raceFlag;
    }
    get immuneFlag() {
        return this.#immuneFlag;
    }
    get folder() {
        return this.#folder;
    }
    get onClick() {
        return this.#onClick;
    }
    get damageMin() {
        return this.#damageMin;
    }
    get damageMax() {
        return this.#damageMax;
    }
    get maxHp() {
        return this.#maxHp;
    }
    get regenCycle() {
        return this.#regenCycle;
    }
    get regenPercent() {
        return this.#regenPercent;
    }
    get goldMin() {
        return this.#goldMin;
    }
    get goldMax() {
        return this.#goldMax;
    }
    get exp() {
        return this.#exp;
    }
    get def() {
        return this.#def;
    }
    get aggressiveHpPct() {
        return this.#aggressiveHpPct;
    }
    get aggressiveSight() {
        return this.#aggressiveSight;
    }
    get attackRange() {
        return this.#attackRange;
    }
    get dropItem() {
        return this.#dropItem;
    }
    get resurrectionId() {
        return this.#resurrectionId;
    }
    get resists() {
        return this.#resists;
    }
    get enchants() {
        return this.#enchants;
    }
    get skills() {
        return this.#skills;
    }
    get damMultiply() {
        return this.#damMultiply;
    }
    get summon() {
        return this.#summon;
    }
    get drainSp() {
        return this.#drainSp;
    }
    get mobColor() {
        return this.#mobColor;
    }
    get polymorphItem() {
        return this.#polymorphItem;
    }
    get hpPercentToGetBerserk() {
        return this.#hpPercentToGetBerserk;
    }
    get hpPercentToGetStoneSkin() {
        return this.#hpPercentToGetStoneSkin;
    }
    get hpPercentToGetGodspeed() {
        return this.#hpPercentToGetGodspeed;
    }
    get hpPercentToGetDeathblow() {
        return this.#hpPercentToGetDeathblow;
    }
    get hpPercentToGetRevive() {
        return this.#hpPercentToGetRevive;
    }
}
