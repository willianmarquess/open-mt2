class Monster {
    #vnum;
    #name;
    #rank;
    #type;
    #battleType;
    #level;
    #size = 0;
    #aiFlag;
    #mountCapacity;
    #raceFlag;
    #immuneFlag;
    #empire;
    #folder;
    #onClick;
    #st;
    #dx;
    #ht;
    #iq;
    #damageMin;
    #damageMax;
    #maxHp;
    #regenCycle;
    #regenPercent;
    #goldMin;
    #goldMax;
    #exp;
    #def;
    #attackSpeed;
    #moveSpeed;
    #aggressiveHpPct;
    #aggressiveSight;
    #attackRange;
    #dropItem;
    #resurrectionVnum;
    #enchantCurse;
    #enchantSlow;
    #enchantPoison;
    #enchantStun;
    #enchantCritical;
    #enchantPenetrate;
    #resistSword;
    #resistTwohand;
    #resistDagger;
    #resistBell;
    #resistFan;
    #resistBow;
    #resistFire;
    #resistElect;
    #resistMagic;
    #resistWind;
    #resistPoison;
    #damMultiply;
    #summon;
    #drainSp;
    #mobColor;
    #polymorphItem;
    #skillLevel0;
    #skillVnum0;
    #skillLevel1;
    #skillVnum1;
    #skillLevel2;
    #skillVnum2;
    #skillLevel3;
    #skillVnum3;
    #skillLevel4;
    #skillVnum4;
    #spBerserk;
    #spStoneskin;
    #spGodspeed;
    #spDeathblow;
    #spRevive;

    constructor({
        vnum,
        name,
        rank,
        type,
        battleType,
        level,
        size = null,
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
        moveSpeed,
        aggressiveHpPct,
        aggressiveSight,
        attackRange,
        dropItem,
        resurrectionVnum,
        enchantCurse,
        enchantSlow,
        enchantPoison,
        enchantStun,
        enchantCritical,
        enchantPenetrate,
        resistSword,
        resistTwohand,
        resistDagger,
        resistBell,
        resistFan,
        resistBow,
        resistFire,
        resistElect,
        resistMagic,
        resistWind,
        resistPoison,
        damMultiply,
        summon,
        drainSp,
        mobColor,
        polymorphItem,
        skillLevel0,
        skillVnum0,
        skillLevel1,
        skillVnum1,
        skillLevel2,
        skillVnum2,
        skillLevel3,
        skillVnum3,
        skillLevel4,
        skillVnum4,
        spBerserk,
        spStoneskin,
        spGodspeed,
        spDeathblow,
        spRevive,
    }) {
        this.#vnum = vnum;
        this.#name = name;
        this.#rank = rank;
        this.#type = type;
        this.#battleType = battleType;
        this.#level = level;
        this.#size = size;
        this.#aiFlag = aiFlag;
        this.#mountCapacity = mountCapacity;
        this.#raceFlag = raceFlag;
        this.#immuneFlag = immuneFlag;
        this.#empire = empire;
        this.#folder = folder;
        this.#onClick = onClick;
        this.#st = st;
        this.#dx = dx;
        this.#ht = ht;
        this.#iq = iq;
        this.#damageMin = damageMin;
        this.#damageMax = damageMax;
        this.#maxHp = maxHp;
        this.#regenCycle = regenCycle;
        this.#regenPercent = regenPercent;
        this.#goldMin = goldMin;
        this.#goldMax = goldMax;
        this.#exp = exp;
        this.#def = def;
        this.#attackSpeed = attackSpeed;
        this.#moveSpeed = moveSpeed;
        this.#aggressiveHpPct = aggressiveHpPct;
        this.#aggressiveSight = aggressiveSight;
        this.#attackRange = attackRange;
        this.#dropItem = dropItem;
        this.#resurrectionVnum = resurrectionVnum;
        this.#enchantCurse = enchantCurse;
        this.#enchantSlow = enchantSlow;
        this.#enchantPoison = enchantPoison;
        this.#enchantStun = enchantStun;
        this.#enchantCritical = enchantCritical;
        this.#enchantPenetrate = enchantPenetrate;
        this.#resistSword = resistSword;
        this.#resistTwohand = resistTwohand;
        this.#resistDagger = resistDagger;
        this.#resistBell = resistBell;
        this.#resistFan = resistFan;
        this.#resistBow = resistBow;
        this.#resistFire = resistFire;
        this.#resistElect = resistElect;
        this.#resistMagic = resistMagic;
        this.#resistWind = resistWind;
        this.#resistPoison = resistPoison;
        this.#damMultiply = damMultiply;
        this.#summon = summon;
        this.#drainSp = drainSp;
        this.#mobColor = mobColor;
        this.#polymorphItem = polymorphItem;
        this.#skillLevel0 = skillLevel0;
        this.#skillVnum0 = skillVnum0;
        this.#skillLevel1 = skillLevel1;
        this.#skillVnum1 = skillVnum1;
        this.#skillLevel2 = skillLevel2;
        this.#skillVnum2 = skillVnum2;
        this.#skillLevel3 = skillLevel3;
        this.#skillVnum3 = skillVnum3;
        this.#skillLevel4 = skillLevel4;
        this.#skillVnum4 = skillVnum4;
        this.#spBerserk = spBerserk;
        this.#spStoneskin = spStoneskin;
        this.#spGodspeed = spGodspeed;
        this.#spDeathblow = spDeathblow;
        this.#spRevive = spRevive;
    }
}
