import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import MathUtil from '@/core/domain/util/MathUtil';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { StatsEnum } from '@/core/enum/StatsEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';
import Player from '../Player';
import JobUtil from '@/core/domain/util/JobUtil';
import { Points } from '../../shared/Points';
import { HORSE_STATS } from '@/core/domain/entities/game/horse/HorseStats';
import MobManager from '@/core/domain/manager/MobManager';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

type StatPoints = {
    st: number;
    ht: number;
    dx: number;
    iq: number;
};

export class PlayerPoints extends Points {
    private level: number;
    private experience: number;
    private health: number;
    private maxHealth: number;
    /** APPLY_MAX_HP (char.cpp:3558): a flat "+N HP" item bonus, separate from the HT-derived base -
     * folded into calcMaxHealth() the same way maxHpPct/partyTankerBonus are. */
    private maxHealthBonus: number = 0;
    private mana: number;
    private maxMana: number;
    /** APPLY_MAX_SP - mirrors maxHealthBonus for mana. */
    private maxManaBonus: number = 0;
    private readonly stamina: number;
    private maxStamina: number;
    private gold: number;
    private st: number;
    private ht: number;
    private dx: number;
    private iq: number;
    private defenseGrade: number;
    private attackSpeed: number;
    private attackGrade: number;
    private moveSpeed: number;
    private defense: number;
    private readonly castingSpeed: number;
    private magicAttGrade: number;
    private magicDefGrade: number;
    private readonly empirePoint: number;
    private readonly levelStep: number;
    private readonly statusPoints: number;
    private subSkill: number;
    private availableSkillPoints: number;
    private readonly minAttackDamage: number;
    private readonly maxAttackDamage: number;
    private readonly playTime: number;
    private readonly hpRegen: number;
    private readonly manaRegen: number;
    private readonly bowDistance: number;
    private readonly hpRecovery: number;
    private readonly manaRecovery: number;
    private readonly poisonChance: number;
    private readonly stunChance: number;
    private readonly slowChance: number;
    private readonly criticalChance: number;
    private readonly penetrateChance: number;
    private readonly curse: number;
    private readonly attbonusHuman: number;
    private readonly attbonusAnimal: number;
    private readonly attbonusOrc: number;
    private readonly attbonusMilgyo: number;
    private readonly attbonusUndead: number;
    private readonly attbonusDevil: number;
    private readonly attbonusInsect: number;
    private readonly attbonusFire: number;
    private readonly attbonusIce: number;
    private readonly attbonusDesert: number;
    private readonly attbonusMonster: number;
    private readonly attbonusWarrior: number;
    private readonly attbonusAssassin: number;
    private readonly attbonusSura: number;
    private readonly attbonusShaman: number;
    private readonly attbonusTree: number;
    private readonly resistWarrior: number;
    private readonly resistAssassin: number;
    private readonly resistSura: number;
    private readonly resistShaman: number;
    private readonly stealHealth: number;
    private readonly stealMana: number;
    private readonly manaBurnPct: number;
    private readonly damageSpRecover: number;
    private readonly block: number;
    private readonly dodge: number;
    private readonly resistSword: number;
    private readonly resistTwohand: number;
    private readonly resistDagger: number;
    private readonly resistBell: number;
    private readonly resistFan: number;
    private readonly resistBow: number;
    private readonly resistFire: number;
    private readonly resistElec: number;
    private readonly resistMagic: number;
    private readonly resistWind: number;
    private resistIce: number = 0;
    private resistEarth: number = 0;
    private resistDark: number = 0;
    private readonly reflectMelee: number;
    private readonly reflectCurse: number;
    private readonly poisonReduce: number;
    private readonly killSpRecover: number;
    private readonly expDoubleBonus: number;
    private readonly goldDoubleBonus: number;
    private readonly itemDropBonus: number;
    private readonly potionBonus: number;
    private readonly killHpRecovery: number;
    private readonly immuneStun: number;
    private readonly immuneSlow: number;
    private readonly immuneFall: number;
    private readonly partyAttackerBonus: number;
    private readonly partyTankerBonus: number;
    private readonly attackBonus: number;
    private readonly defenseBonus: number;
    private readonly attGradeBonus: number;
    private readonly defGradeBonus: number;
    private readonly magicAttGradeBonus: number;
    private readonly magicDefGradeBonus: number;
    private readonly resistNormalDamage: number;
    private readonly hitHealthRecovery: number;
    private readonly hitManaRecovery: number;
    private readonly manashield: number;
    private readonly partyBufferBonus: number;
    private readonly partySkillMasterBonus: number;
    private readonly hpRecoverContinue: number;
    private readonly spRecoverContinue: number;
    private readonly stealGold: number;
    private polymorph: number;
    private readonly mount: number;
    private readonly partyHasteBonus: number;
    private readonly partyDefenderBonus: number;
    private statResetCount: number;
    private horseSkill: number;
    private readonly mallAttbonus: number;
    private readonly mallDefbonus: number;
    private readonly mallExpbonus: number;
    private readonly mallItemBonus: number;
    private readonly mallGoldbonus: number;
    private readonly maxHpPct: number;
    private readonly maxSpPct: number;
    private readonly skillDamageBonus: number;
    private readonly normalHitDamageBonus: number;
    private readonly skillDefendBonus: number;
    private readonly normalHitDefendBonus: number;
    private readonly pcBangExpBonus: number;
    private readonly pcBangDropBonus: number;
    private readonly ramadanCandyBonusExp: number;
    private readonly energy: number;
    private energyEndTime: number;
    private readonly costumeAttrBonus: number;
    private readonly magicAttBonusPer: number;
    private readonly meleeMagicAttBonusPer: number;
    private readonly resistCritical: number;
    private readonly resistPenetrate: number;
    private readonly minWeaponDamage: number;
    private readonly maxWeaponDamage: number;

    private readonly experienceManager: ExperienceManager;
    private readonly mobManager: MobManager;
    private readonly config: GameConfig;

    private givenStatusPoints: number;
    private availableStatusPoints: number;
    private readonly hpPerLvl: number;
    private readonly hpPerHtPoint: number;
    private readonly mpPerLvl: number;
    private readonly mpPerIqPoint: number;
    private readonly baseHealth: number;
    private readonly baseMana: number;
    private readonly defensePerHtPoint: number;
    private readonly attackPerStPoint: number;
    private readonly attackPerDxPoint: number;
    private readonly attackPerIqPoint: number;
    private readonly baseMovementSpeed: number;
    private readonly baseAttackSpeed: number;

    private readonly player: Player;

    constructor(
        {
            level = 1,
            experience = 0,
            health = 0,
            maxHealth = 0,
            mana = 0,
            maxMana = 0,
            stamina = 0,
            maxStamina = 0,
            gold = 0,
            st = 0,
            ht = 0,
            dx = 0,
            iq = 0,
            defenseGrade = 0,
            attackSpeed = 0,
            attackGrade = 0,
            moveSpeed = 0,
            defense = 0,
            castingSpeed = 0,
            magicAttGrade = 0,
            magicDefGrade = 0,
            empirePoint = 0,
            levelStep = 0,
            statusPoints = 0,
            subSkill = 0,
            minAttackDamage = 0,
            maxAttackDamage = 0,
            playTime = 0,
            hpRegen = 0,
            manaRegen = 0,
            bowDistance = 0,
            hpRecovery = 0,
            manaRecovery = 0,
            poisonChance = 0,
            stunChance = 0,
            slowChance = 0,
            criticalChance = 0,
            penetrateChance = 0,
            curse = 0,
            attbonusHuman = 0,
            attbonusAnimal = 0,
            attbonusOrc = 0,
            attbonusMilgyo = 0,
            attbonusUndead = 0,
            attbonusDevil = 0,
            attbonusInsect = 0,
            attbonusFire = 0,
            attbonusIce = 0,
            attbonusDesert = 0,
            attbonusMonster = 0,
            attbonusWarrior = 0,
            attbonusAssassin = 0,
            attbonusSura = 0,
            attbonusShaman = 0,
            attbonusTree = 0,
            resistWarrior = 0,
            resistAssassin = 0,
            resistSura = 0,
            resistShaman = 0,
            stealHealth = 0,
            stealMana = 0,
            manaBurnPct = 0,
            damageSpRecover = 0,
            block = 0,
            dodge = 0,
            resistSword = 0,
            resistTwohand = 0,
            resistDagger = 0,
            resistBell = 0,
            resistFan = 0,
            resistBow = 0,
            resistFire = 0,
            resistElec = 0,
            resistMagic = 0,
            resistWind = 0,
            reflectMelee = 0,
            reflectCurse = 0,
            poisonReduce = 0,
            killSpRecover = 0,
            expDoubleBonus = 0,
            goldDoubleBonus = 0,
            itemDropBonus = 0,
            potionBonus = 0,
            killHpRecovery = 0,
            immuneStun = 0,
            immuneSlow = 0,
            immuneFall = 0,
            partyAttackerBonus = 0,
            partyTankerBonus = 0,
            attackBonus = 0,
            defenseBonus = 0,
            attGradeBonus = 0,
            defGradeBonus = 0,
            magicAttGradeBonus = 0,
            magicDefGradeBonus = 0,
            resistNormalDamage = 0,
            hitHealthRecovery = 0,
            hitManaRecovery = 0,
            manashield = 0,
            partyBufferBonus = 0,
            partySkillMasterBonus = 0,
            hpRecoverContinue = 0,
            spRecoverContinue = 0,
            stealGold = 0,
            polymorph = 0,
            mount = 0,
            partyHasteBonus = 0,
            partyDefenderBonus = 0,
            statResetCount = 0,
            horseSkill = 0,
            mallAttbonus = 0,
            mallDefbonus = 0,
            mallExpbonus = 0,
            mallItemBonus = 0,
            mallGoldbonus = 0,
            maxHpPct = 0,
            maxSpPct = 0,
            skillDamageBonus = 0,
            normalHitDamageBonus = 0,
            skillDefendBonus = 0,
            normalHitDefendBonus = 0,
            pcBangExpBonus = 0,
            pcBangDropBonus = 0,
            ramadanCandyBonusExp = 0,
            energy = 0,
            energyEndTime = 0,
            costumeAttrBonus = 0,
            magicAttBonusPer = 0,
            meleeMagicAttBonusPer = 0,
            resistCritical = 0,
            resistPenetrate = 0,
            minWeaponDamage = 0,
            maxWeaponDamage = 0,

            givenStatusPoints = 0,
            availableStatusPoints = 0,
            availableSkillPoints = 0,
            hpPerLvl,
            hpPerHtPoint,
            mpPerLvl,
            mpPerIqPoint,
            baseHealth,
            baseMana,
            defensePerHtPoint,
            attackPerStPoint,
            attackPerDxPoint,
            attackPerIqPoint,
            baseAttackSpeed,
            baseMovementSpeed,
        }: {
            level?: number;
            experience?: number;
            health?: number;
            maxHealth?: number;
            mana?: number;
            maxMana?: number;
            stamina?: number;
            maxStamina?: number;
            gold?: number;
            st?: number;
            ht?: number;
            dx?: number;
            iq?: number;
            defenseGrade?: number;
            attackSpeed?: number;
            attackGrade?: number;
            moveSpeed?: number;
            defense?: number;
            castingSpeed?: number;
            magicAttGrade?: number;
            magicDefGrade?: number;
            empirePoint?: number;
            levelStep?: number;
            statusPoints?: number;
            subSkill?: number;
            skill?: number;
            minAttackDamage?: number;
            maxAttackDamage?: number;
            playTime?: number;
            hpRegen?: number;
            manaRegen?: number;
            bowDistance?: number;
            hpRecovery?: number;
            manaRecovery?: number;
            poisonChance?: number;
            stunChance?: number;
            slowChance?: number;
            criticalChance?: number;
            penetrateChance?: number;
            curse?: number;
            attbonusHuman?: number;
            attbonusAnimal?: number;
            attbonusOrc?: number;
            attbonusMilgyo?: number;
            attbonusUndead?: number;
            attbonusDevil?: number;
            attbonusInsect?: number;
            attbonusFire?: number;
            attbonusIce?: number;
            attbonusDesert?: number;
            attbonusMonster?: number;
            attbonusWarrior?: number;
            attbonusAssassin?: number;
            attbonusSura?: number;
            attbonusShaman?: number;
            attbonusTree?: number;
            resistWarrior?: number;
            resistAssassin?: number;
            resistSura?: number;
            resistShaman?: number;
            stealHealth?: number;
            stealMana?: number;
            manaBurnPct?: number;
            damageSpRecover?: number;
            block?: number;
            dodge?: number;
            resistSword?: number;
            resistTwohand?: number;
            resistDagger?: number;
            resistBell?: number;
            resistFan?: number;
            resistBow?: number;
            resistFire?: number;
            resistElec?: number;
            resistMagic?: number;
            resistWind?: number;
            reflectMelee?: number;
            reflectCurse?: number;
            poisonReduce?: number;
            killSpRecover?: number;
            expDoubleBonus?: number;
            goldDoubleBonus?: number;
            itemDropBonus?: number;
            potionBonus?: number;
            killHpRecovery?: number;
            immuneStun?: number;
            immuneSlow?: number;
            immuneFall?: number;
            partyAttackerBonus?: number;
            partyTankerBonus?: number;
            attackBonus?: number;
            defenseBonus?: number;
            attGradeBonus?: number;
            defGradeBonus?: number;
            magicAttGradeBonus?: number;
            magicDefGradeBonus?: number;
            resistNormalDamage?: number;
            hitHealthRecovery?: number;
            hitManaRecovery?: number;
            manashield?: number;
            partyBufferBonus?: number;
            partySkillMasterBonus?: number;
            hpRecoverContinue?: number;
            spRecoverContinue?: number;
            stealGold?: number;
            polymorph?: number;
            mount?: number;
            partyHasteBonus?: number;
            partyDefenderBonus?: number;
            statResetCount?: number;
            horseSkill?: number;
            mallAttbonus?: number;
            mallDefbonus?: number;
            mallExpbonus?: number;
            mallItemBonus?: number;
            mallGoldbonus?: number;
            maxHpPct?: number;
            maxSpPct?: number;
            skillDamageBonus?: number;
            normalHitDamageBonus?: number;
            skillDefendBonus?: number;
            normalHitDefendBonus?: number;
            pcBangExpBonus?: number;
            pcBangDropBonus?: number;
            ramadanCandyBonusExp?: number;
            energy?: number;
            energyEndTime?: number;
            costumeAttrBonus?: number;
            magicAttBonusPer?: number;
            meleeMagicAttBonusPer?: number;
            resistCritical?: number;
            resistPenetrate?: number;
            minWeaponDamage?: number;
            maxWeaponDamage?: number;
            givenStatusPoints: number;
            availableStatusPoints: number;
            availableSkillPoints: number;
            hpPerLvl: number;
            hpPerHtPoint: number;
            mpPerLvl: number;
            mpPerIqPoint: number;
            baseHealth: number;
            baseMana: number;
            defensePerHtPoint: number;
            attackPerStPoint: number;
            attackPerDxPoint: number;
            attackPerIqPoint: number;
            baseMovementSpeed: number;
            baseAttackSpeed: number;
        },
        {
            config,
            experienceManager,
            player,
            mobManager,
        }: {
            experienceManager: ExperienceManager;
            config: GameConfig;
            player: Player;
            mobManager: MobManager;
        },
    ) {
        super();
        this.level = level;
        this.experience = experience;
        this.health = health;
        this.maxHealth = maxHealth;
        this.mana = mana;
        this.maxMana = maxMana;
        this.stamina = stamina;
        this.maxStamina = maxStamina;
        this.gold = gold;
        this.st = st;
        this.ht = ht;
        this.dx = dx;
        this.iq = iq;
        this.defenseGrade = defenseGrade;
        this.attackSpeed = attackSpeed;
        this.attackGrade = attackGrade;
        this.moveSpeed = moveSpeed;
        this.defense = defense;
        this.castingSpeed = castingSpeed;
        this.magicAttGrade = magicAttGrade;
        this.magicDefGrade = magicDefGrade;
        this.empirePoint = empirePoint;
        this.levelStep = levelStep;
        this.statusPoints = statusPoints;
        this.subSkill = subSkill;
        this.minAttackDamage = minAttackDamage;
        this.maxAttackDamage = maxAttackDamage;
        this.playTime = playTime;
        this.hpRegen = hpRegen;
        this.manaRegen = manaRegen;
        this.bowDistance = bowDistance;
        this.hpRecovery = hpRecovery;
        this.manaRecovery = manaRecovery;
        this.poisonChance = poisonChance;
        this.stunChance = stunChance;
        this.slowChance = slowChance;
        this.criticalChance = criticalChance;
        this.penetrateChance = penetrateChance;
        this.curse = curse;
        this.attbonusHuman = attbonusHuman;
        this.attbonusAnimal = attbonusAnimal;
        this.attbonusOrc = attbonusOrc;
        this.attbonusMilgyo = attbonusMilgyo;
        this.attbonusUndead = attbonusUndead;
        this.attbonusDevil = attbonusDevil;
        this.attbonusInsect = attbonusInsect;
        this.attbonusFire = attbonusFire;
        this.attbonusIce = attbonusIce;
        this.attbonusDesert = attbonusDesert;
        this.attbonusMonster = attbonusMonster;
        this.attbonusWarrior = attbonusWarrior;
        this.attbonusAssassin = attbonusAssassin;
        this.attbonusSura = attbonusSura;
        this.attbonusShaman = attbonusShaman;
        this.attbonusTree = attbonusTree;
        this.resistWarrior = resistWarrior;
        this.resistAssassin = resistAssassin;
        this.resistSura = resistSura;
        this.resistShaman = resistShaman;
        this.stealHealth = stealHealth;
        this.stealMana = stealMana;
        this.manaBurnPct = manaBurnPct;
        this.damageSpRecover = damageSpRecover;
        this.block = block;
        this.dodge = dodge;
        this.resistSword = resistSword;
        this.resistTwohand = resistTwohand;
        this.resistDagger = resistDagger;
        this.resistBell = resistBell;
        this.resistFan = resistFan;
        this.resistBow = resistBow;
        this.resistFire = resistFire;
        this.resistElec = resistElec;
        this.resistMagic = resistMagic;
        this.resistWind = resistWind;
        this.reflectMelee = reflectMelee;
        this.reflectCurse = reflectCurse;
        this.poisonReduce = poisonReduce;
        this.killSpRecover = killSpRecover;
        this.expDoubleBonus = expDoubleBonus;
        this.goldDoubleBonus = goldDoubleBonus;
        this.itemDropBonus = itemDropBonus;
        this.potionBonus = potionBonus;
        this.killHpRecovery = killHpRecovery;
        this.immuneStun = immuneStun;
        this.immuneSlow = immuneSlow;
        this.immuneFall = immuneFall;
        this.partyAttackerBonus = partyAttackerBonus;
        this.partyTankerBonus = partyTankerBonus;
        this.attackBonus = attackBonus;
        this.defenseBonus = defenseBonus;
        this.attGradeBonus = attGradeBonus;
        this.defGradeBonus = defGradeBonus;
        this.magicAttGradeBonus = magicAttGradeBonus;
        this.magicDefGradeBonus = magicDefGradeBonus;
        this.resistNormalDamage = resistNormalDamage;
        this.hitHealthRecovery = hitHealthRecovery;
        this.hitManaRecovery = hitManaRecovery;
        this.manashield = manashield;
        this.partyBufferBonus = partyBufferBonus;
        this.partySkillMasterBonus = partySkillMasterBonus;
        this.hpRecoverContinue = hpRecoverContinue;
        this.spRecoverContinue = spRecoverContinue;
        this.stealGold = stealGold;
        this.polymorph = polymorph;
        this.mount = mount;
        this.partyHasteBonus = partyHasteBonus;
        this.partyDefenderBonus = partyDefenderBonus;
        this.statResetCount = statResetCount;
        this.horseSkill = horseSkill;
        this.mallAttbonus = mallAttbonus;
        this.mallDefbonus = mallDefbonus;
        this.mallExpbonus = mallExpbonus;
        this.mallItemBonus = mallItemBonus;
        this.mallGoldbonus = mallGoldbonus;
        this.maxHpPct = maxHpPct;
        this.maxSpPct = maxSpPct;
        this.skillDamageBonus = skillDamageBonus;
        this.normalHitDamageBonus = normalHitDamageBonus;
        this.skillDefendBonus = skillDefendBonus;
        this.normalHitDefendBonus = normalHitDefendBonus;
        this.pcBangExpBonus = pcBangExpBonus;
        this.pcBangDropBonus = pcBangDropBonus;
        this.ramadanCandyBonusExp = ramadanCandyBonusExp;
        this.energy = energy;
        this.energyEndTime = energyEndTime;
        this.costumeAttrBonus = costumeAttrBonus;
        this.magicAttBonusPer = magicAttBonusPer;
        this.meleeMagicAttBonusPer = meleeMagicAttBonusPer;
        this.resistCritical = resistCritical;
        this.resistPenetrate = resistPenetrate;
        this.minWeaponDamage = minWeaponDamage;
        this.maxWeaponDamage = maxWeaponDamage;

        this.hpPerLvl = hpPerLvl;
        this.hpPerHtPoint = hpPerHtPoint;
        this.mpPerLvl = mpPerLvl;
        this.mpPerIqPoint = mpPerIqPoint;
        this.baseMana = baseMana;
        this.baseHealth = baseHealth;
        this.defensePerHtPoint = defensePerHtPoint;
        this.attackPerStPoint = attackPerStPoint;
        this.attackPerDxPoint = attackPerDxPoint;
        this.attackPerIqPoint = attackPerIqPoint;
        this.givenStatusPoints = givenStatusPoints;
        this.availableStatusPoints = availableStatusPoints;
        this.availableSkillPoints = availableSkillPoints;
        this.baseAttackSpeed = baseAttackSpeed;
        this.baseMovementSpeed = baseMovementSpeed;

        this.config = config;
        this.experienceManager = experienceManager;
        this.mobManager = mobManager;
        this.player = player;

        this.points.set(PointsEnum.EXPERIENCE, {
            get: () => this.experience,
            add: (value: number) => this.addExperience(value),
        });
        this.points.set(PointsEnum.HT, {
            get: () => this.getEffectiveStat(PointsEnum.HT),
            add: (value: number) => this.addStat(StatsEnum.HT, value),
            afterAddHooks: () => [this.calcDefense, this.calcMagicDefense, this.calcMaxHealth],
        });
        this.points.set(PointsEnum.ST, {
            get: () => this.getEffectiveStat(PointsEnum.ST),
            add: (value: number) => this.addStat(StatsEnum.ST, value),
            afterAddHooks: () => [this.calcAttack],
        });
        this.points.set(PointsEnum.IQ, {
            get: () => this.getEffectiveStat(PointsEnum.IQ),
            add: (value: number) => this.addStat(StatsEnum.IQ, value),
            afterAddHooks: () => [this.calcAttack, this.calcMagicAttack, this.calcMagicDefense, this.calcMaxMana],
        });
        this.points.set(PointsEnum.DX, {
            get: () => this.getEffectiveStat(PointsEnum.DX),
            add: (value: number) => this.addStat(StatsEnum.DX, value),
            afterAddHooks: () => [this.calcAttack],
        });
        this.points.set(PointsEnum.GOLD, {
            get: () => this.gold,
            add: (value: number) => this.addGold(value),
        });
        this.points.set(PointsEnum.LEVEL, {
            get: () => this.level,
            add: (value: number) => this.addLevel(value),
            set: (value: number) => this.setLevel(value),
            afterAddHooks: () => [this.calcPointsAndResetValues],
        });
        this.points.set(PointsEnum.ATTACK_GRADE, {
            add: (value) => this.addCommonPoint(value, 'attackGrade'),
            afterAddHooks: () => [this.calcAttack],
            get: () => this.attackGrade,
        });
        // POINT_ATT_GRADE_BONUS (char.h:219, skill.cpp:54): what a skill/item actually targets when
        // its data names the point-on "ATT_GRADE" - NOT attackGrade itself. attackGrade is fully
        // recomputed from scratch by calcAttack() on every stat change, so adding straight to it (as
        // this port used to) gets silently wiped by the very next recompute; attGradeBonus survives
        // that because calcAttack() folds it back in each time (char.cpp:2056-2058).
        this.points.set(PointsEnum.ATT_GRADE_BONUS, {
            get: () => this.attGradeBonus,
            add: (value) => this.addCommonPoint(value, 'attGradeBonus'),
            afterAddHooks: () => [this.calcAttack],
        });
        this.points.set(PointsEnum.ATTACK_BONUS, {
            get: () => this.attackBonus,
            add: (value) => this.addCommonPoint(value, 'attackBonus'),
        });
        this.points.set(PointsEnum.MAGIC_ATT_GRADE, {
            get: () => this.magicAttGrade,
        });
        this.points.set(PointsEnum.MAGIC_ATT_GRADE_BONUS, {
            get: () => this.magicAttGradeBonus,
            add: (value) => this.addCommonPoint(value, 'magicAttGradeBonus'),
            afterAddHooks: () => [this.calcMagicAttack],
        });
        this.points.set(PointsEnum.DEFENSE, {
            get: () => this.defense,
        });
        this.points.set(PointsEnum.DEFENSE_GRADE, {
            get: () => this.defenseGrade,
            add: (value) => this.addCommonPoint(value, 'defenseGrade'),
            afterAddHooks: () => [this.calcDefense],
        });
        // POINT_DEF_GRADE_BONUS - mirrors ATT_GRADE_BONUS above: what a skill/item actually targets
        // when its data names the point-on "DEF_GRADE", not defenseGrade itself (which calcDefense()
        // fully recomputes from scratch).
        this.points.set(PointsEnum.DEF_GRADE_BONUS, {
            get: () => this.defGradeBonus,
            add: (value) => this.addCommonPoint(value, 'defGradeBonus'),
            afterAddHooks: () => [this.calcDefense],
        });
        this.points.set(PointsEnum.DEFENSE_BONUS, {
            get: () => this.defenseBonus,
            add: (value) => this.addCommonPoint(value, 'defenseBonus'),
        });
        this.points.set(PointsEnum.MAGIC_DEF_GRADE, {
            get: () => this.magicDefGrade,
        });
        this.points.set(PointsEnum.MAGIC_DEF_GRADE_BONUS, {
            get: () => this.magicDefGradeBonus,
            add: (value) => this.addCommonPoint(value, 'magicDefGradeBonus'),
            afterAddHooks: () => [this.calcMagicDefense],
        });
        this.points.set(PointsEnum.HP_REGEN, {
            get: () => this.hpRegen,
            add: (value) => this.addCommonPoint(value, 'hpRegen'),
        });
        this.points.set(PointsEnum.MANA_REGEN, {
            get: () => this.manaRegen,
            add: (value) => this.addCommonPoint(value, 'manaRegen'),
        });
        this.points.set(PointsEnum.ATTACK_SPEED, {
            get: () => this.attackSpeed,
            add: (value) => this.addCommonPoint(value, 'attackSpeed', MathUtil.MAX_TINY),
        });
        this.points.set(PointsEnum.MOVE_SPEED, {
            get: () => this.moveSpeed,
            add: (value) => this.addCommonPoint(value, 'moveSpeed', MathUtil.MAX_TINY),
        });
        this.points.set(PointsEnum.NEEDED_EXPERIENCE, {
            get: () => this.experienceManager.getNeededExperience(this.level),
        });
        this.points.set(PointsEnum.STATUS_POINTS, {
            get: () => this.availableStatusPoints,
        });
        this.points.set(PointsEnum.MALL_ITEM_BONUS, {
            get: () => this.mallItemBonus,
            add: (value) => this.addCommonPoint(value, 'mallItemBonus'),
        });
        this.points.set(PointsEnum.ITEM_DROP_BONUS, {
            get: () => this.itemDropBonus,
            add: (value) => this.addCommonPoint(value, 'itemDropBonus'),
        });
        this.points.set(PointsEnum.POISON_CHANCE, {
            get: () => this.poisonChance,
            add: (value) => this.addCommonPoint(value, 'poisonChance'),
        });
        this.points.set(PointsEnum.SLOW_CHANCE, {
            get: () => this.slowChance,
            add: (value) => this.addCommonPoint(value, 'slowChance'),
        });
        this.points.set(PointsEnum.STUN_CHANCE, {
            get: () => this.stunChance,
            add: (value) => this.addCommonPoint(value, 'stunChance'),
        });
        this.points.set(PointsEnum.CRITICAL_CHANCE, {
            get: () => this.criticalChance,
            add: (value) => this.addCommonPoint(value, 'criticalChance'),
        });
        this.points.set(PointsEnum.PENETRATE_CHANCE, {
            get: () => this.penetrateChance,
            add: (value) => this.addCommonPoint(value, 'penetrateChance'),
        });
        this.points.set(PointsEnum.STEAL_HEALTH, {
            get: () => this.stealHealth,
            add: (value) => this.addCommonPoint(value, 'stealHealth'),
        });
        this.points.set(PointsEnum.STEAL_MANA, {
            get: () => this.stealMana,
            add: (value) => this.addCommonPoint(value, 'stealMana'),
        });
        this.points.set(PointsEnum.STEAL_GOLD, {
            get: () => this.stealGold,
            add: (value) => this.addCommonPoint(value, 'stealGold'),
        });
        this.points.set(PointsEnum.HIT_HEALTH_RECOVERY, {
            get: () => this.hitHealthRecovery,
            add: (value) => this.addCommonPoint(value, 'hitHealthRecovery'),
        });
        this.points.set(PointsEnum.HIT_MANA_RECOVERY, {
            get: () => this.hitManaRecovery,
            add: (value) => this.addCommonPoint(value, 'hitManaRecovery'),
        });
        this.points.set(PointsEnum.HEALTH, {
            get: () => this.health,
            add: (value) => this.addHealth(value),
        });
        this.points.set(PointsEnum.MAX_HEALTH, {
            get: () => this.maxHealth,
            add: (value) => this.addCommonPoint(value, 'maxHealthBonus'),
            afterAddHooks: () => [this.calcMaxHealth],
        });
        this.points.set(PointsEnum.MANA, {
            get: () => this.mana,
            add: (value) => this.addMana(value),
        });
        this.points.set(PointsEnum.MAX_MANA, {
            get: () => this.maxMana,
            add: (value) => this.addCommonPoint(value, 'maxManaBonus'),
            afterAddHooks: () => [this.calcMaxMana],
        });
        this.points.set(PointsEnum.PLAY_TIME, {
            get: () => this.playTime,
        });
        this.points.set(PointsEnum.STAMINA, {
            get: () => this.stamina,
        });
        // These weapon-type/magic resists used to be get-only: fine for a mob_proto's fixed base
        // value, but a Player's only ever come from equipped items, so they need to be addable too
        // (PlayerApplies on equip/unequip).
        this.points.set(PointsEnum.RESIST_SWORD, {
            get: () => this.resistSword,
            add: (value) => this.addCommonPoint(value, 'resistSword'),
        });
        this.points.set(PointsEnum.RESIST_TWOHAND, {
            get: () => this.resistTwohand,
            add: (value) => this.addCommonPoint(value, 'resistTwohand'),
        });
        this.points.set(PointsEnum.RESIST_DAGGER, {
            get: () => this.resistDagger,
            add: (value) => this.addCommonPoint(value, 'resistDagger'),
        });
        this.points.set(PointsEnum.RESIST_BELL, {
            get: () => this.resistBell,
            add: (value) => this.addCommonPoint(value, 'resistBell'),
        });
        this.points.set(PointsEnum.RESIST_FAN, {
            get: () => this.resistFan,
            add: (value) => this.addCommonPoint(value, 'resistFan'),
        });
        this.points.set(PointsEnum.RESIST_BOW, {
            get: () => this.resistBow,
            add: (value) => this.addCommonPoint(value, 'resistBow'),
        });
        this.points.set(PointsEnum.RESIST_MAGIC, {
            get: () => this.resistMagic,
            add: (value) => this.addCommonPoint(value, 'resistMagic'),
        });
        this.points.set(PointsEnum.REFLECT_MELEE, {
            get: () => this.reflectMelee,
            add: (value) => this.addCommonPoint(value, 'reflectMelee'),
        });
        this.points.set(PointsEnum.DODGE, {
            get: () => this.dodge,
        });
        this.points.set(PointsEnum.BLOCK, {
            get: () => this.block,
        });
        this.points.set(PointsEnum.MANA_RECOVERY, {
            get: () => this.manaRecovery,
            add: (value) => this.addCommonPoint(value, 'manaRecovery'),
        });
        this.points.set(PointsEnum.HP_RECOVERY, {
            get: () => this.hpRecovery,
            add: (value) => this.addCommonPoint(value, 'hpRecovery'),
        });
        this.points.set(PointsEnum.POLYMORPH, {
            get: () => this.polymorph,
            set: (value: number) => {
                this.polymorph = value;
                this.player.setPolymorph(value);
            },
            add: (value: number) => {
                this.polymorph = value;
                this.player.setPolymorph(value);
            },
        });
        this.points.set(PointsEnum.SKILL, {
            get: () => this.availableSkillPoints,
            add: (value) => this.addCommonPoint(value, 'availableSkillPoints'),
            set: (value) => (this.availableSkillPoints = value),
        });
        this.points.set(PointsEnum.SUB_SKILL, {
            get: () => this.subSkill,
            add: (value) => this.addCommonPoint(value, 'subSkill'),
            set: (value) => (this.subSkill = value),
        });
        this.points.set(PointsEnum.HORSE_SKILL, {
            get: () => this.horseSkill,
            add: (value) => this.addCommonPoint(value, 'horseSkill'),
            set: (value) => (this.horseSkill = value),
        });
        this.points.set(PointsEnum.MOUNT, {
            get: () => this.player.getMountVnum(),
        });
        this.points.set(PointsEnum.HORSE_SKILL, {
            get: () => this.player.getHorseLevel(),
        });

        // Previously-unwired points: the fields/constructor plumbing already existed, but nothing
        // registered them here, so addPoint()/getPoint() silently no-op'd for every skill/item that
        // targets one of these (see issue: Aura of Sword not raising attack, same root cause class).
        this.points.set(PointsEnum.CASTING_SPEED, {
            get: () => this.castingSpeed,
            add: (value) => this.addCommonPoint(value, 'castingSpeed'),
        });
        this.points.set(PointsEnum.BOW_DISTANCE, {
            get: () => this.bowDistance,
            add: (value) => this.addCommonPoint(value, 'bowDistance'),
        });
        this.points.set(PointsEnum.ATTBONUS_HUMAN, {
            get: () => this.attbonusHuman,
            add: (value) => this.addCommonPoint(value, 'attbonusHuman'),
        });
        this.points.set(PointsEnum.ATTBONUS_ANIMAL, {
            get: () => this.attbonusAnimal,
            add: (value) => this.addCommonPoint(value, 'attbonusAnimal'),
        });
        this.points.set(PointsEnum.ATTBONUS_ORC, {
            get: () => this.attbonusOrc,
            add: (value) => this.addCommonPoint(value, 'attbonusOrc'),
        });
        this.points.set(PointsEnum.ATTBONUS_MILGYO, {
            get: () => this.attbonusMilgyo,
            add: (value) => this.addCommonPoint(value, 'attbonusMilgyo'),
        });
        this.points.set(PointsEnum.ATTBONUS_UNDEAD, {
            get: () => this.attbonusUndead,
            add: (value) => this.addCommonPoint(value, 'attbonusUndead'),
        });
        this.points.set(PointsEnum.ATTBONUS_DEVIL, {
            get: () => this.attbonusDevil,
            add: (value) => this.addCommonPoint(value, 'attbonusDevil'),
        });
        this.points.set(PointsEnum.ATTBONUS_INSECT, {
            get: () => this.attbonusInsect,
            add: (value) => this.addCommonPoint(value, 'attbonusInsect'),
        });
        this.points.set(PointsEnum.ATTBONUS_FIRE, {
            get: () => this.attbonusFire,
            add: (value) => this.addCommonPoint(value, 'attbonusFire'),
        });
        this.points.set(PointsEnum.ATTBONUS_ICE, {
            get: () => this.attbonusIce,
            add: (value) => this.addCommonPoint(value, 'attbonusIce'),
        });
        this.points.set(PointsEnum.ATTBONUS_DESERT, {
            get: () => this.attbonusDesert,
            add: (value) => this.addCommonPoint(value, 'attbonusDesert'),
        });
        this.points.set(PointsEnum.ATTBONUS_MONSTER, {
            get: () => this.attbonusMonster,
            add: (value) => this.addCommonPoint(value, 'attbonusMonster'),
        });
        this.points.set(PointsEnum.ATTBONUS_TREE, {
            get: () => this.attbonusTree,
            add: (value) => this.addCommonPoint(value, 'attbonusTree'),
        });
        this.points.set(PointsEnum.POISON_REDUCE, {
            get: () => this.poisonReduce,
            add: (value) => this.addCommonPoint(value, 'poisonReduce'),
        });
        this.points.set(PointsEnum.EXP_DOUBLE_BONUS, {
            get: () => this.expDoubleBonus,
            add: (value) => this.addCommonPoint(value, 'expDoubleBonus'),
        });
        this.points.set(PointsEnum.POTION_BONUS, {
            get: () => this.potionBonus,
            add: (value) => this.addCommonPoint(value, 'potionBonus'),
        });
        this.points.set(PointsEnum.IMMUNE_STUN, {
            get: () => this.immuneStun,
            add: (value) => this.addCommonPoint(value, 'immuneStun'),
        });
        this.points.set(PointsEnum.PARTY_ATTACKER_BONUS, {
            get: () => this.partyAttackerBonus,
            add: (value) => this.addCommonPoint(value, 'partyAttackerBonus'),
        });
        this.points.set(PointsEnum.RESIST_NORMAL_DAMAGE, {
            get: () => this.resistNormalDamage,
            add: (value) => this.addCommonPoint(value, 'resistNormalDamage'),
        });
        this.points.set(PointsEnum.MANASHIELD, {
            get: () => this.manashield,
            add: (value) => this.addCommonPoint(value, 'manashield'),
        });
        this.points.set(PointsEnum.MALL_ATTBONUS, {
            get: () => this.mallAttbonus,
            add: (value) => this.addCommonPoint(value, 'mallAttbonus'),
        });
        // POINT_MAX_HP_PCT (char.cpp:3159-3160): folded into calcMaxHealth() as a capped percentage
        // bonus on top of the base, mirroring `std::min(3500, hp * GetPoint(POINT_MAX_HP_PCT) / 100)`.
        this.points.set(PointsEnum.MAX_HP_PCT, {
            get: () => this.maxHpPct,
            add: (value) => this.addCommonPoint(value, 'maxHpPct'),
            afterAddHooks: () => [this.calcMaxHealth],
        });
        this.points.set(PointsEnum.SKILL_DAMAGE_BONUS, {
            get: () => this.skillDamageBonus,
            add: (value) => this.addCommonPoint(value, 'skillDamageBonus'),
        });
        this.points.set(PointsEnum.NORMAL_HIT_DAMAGE_BONUS, {
            get: () => this.normalHitDamageBonus,
            add: (value) => this.addCommonPoint(value, 'normalHitDamageBonus'),
        });
        this.points.set(PointsEnum.SKILL_DEFEND_BONUS, {
            get: () => this.skillDefendBonus,
            add: (value) => this.addCommonPoint(value, 'skillDefendBonus'),
        });
        this.points.set(PointsEnum.NORMAL_HIT_DEFEND_BONUS, {
            get: () => this.normalHitDefendBonus,
            add: (value) => this.addCommonPoint(value, 'normalHitDefendBonus'),
        });
        this.points.set(PointsEnum.MAGIC_ATT_BONUS_PER, {
            get: () => this.magicAttBonusPer,
            add: (value) => this.addCommonPoint(value, 'magicAttBonusPer'),
        });
        this.points.set(PointsEnum.MELEE_MAGIC_ATT_BONUS_PER, {
            get: () => this.meleeMagicAttBonusPer,
            add: (value) => this.addCommonPoint(value, 'meleeMagicAttBonusPer'),
        });

        // Remaining previously-unwired points (no consumer reads these yet anywhere in the codebase -
        // wired here so addPoint()/getPoint() at least round-trip instead of silently no-oping, ready
        // for whichever feature/skill/item ends up needing them).
        this.points.set(PointsEnum.MAX_STAMINA, {
            get: () => this.maxStamina,
            add: (value) => this.addCommonPoint(value, 'maxStamina'),
        });
        this.points.set(PointsEnum.EMPIRE_POINT, {
            get: () => this.empirePoint,
            add: (value) => this.addCommonPoint(value, 'empirePoint'),
        });
        this.points.set(PointsEnum.LEVEL_STEP, {
            get: () => this.levelStep,
            add: (value) => this.addCommonPoint(value, 'levelStep'),
        });
        // MIN/MAX_WEAPON_DAMAGE: no POINT_MIN/MAX_WEAPON_DAMAGE exists in the original at all - reads
        // straight off the equipped weapon, matching what a "weapon damage range" display would want.
        this.points.set(PointsEnum.MIN_WEAPON_DAMAGE, {
            get: () => this.player.getWeaponValues().physic.min,
        });
        this.points.set(PointsEnum.MAX_WEAPON_DAMAGE, {
            get: () => this.player.getWeaponValues().physic.max,
        });
        this.points.set(PointsEnum.MIN_ATTACK_DAMAGE, {
            get: () => this.minAttackDamage,
            add: (value) => this.addCommonPoint(value, 'minAttackDamage'),
        });
        this.points.set(PointsEnum.MAX_ATTACK_DAMAGE, {
            get: () => this.maxAttackDamage,
            add: (value) => this.addCommonPoint(value, 'maxAttackDamage'),
        });
        this.points.set(PointsEnum.CURSE, {
            get: () => this.curse,
            add: (value) => this.addCommonPoint(value, 'curse'),
        });
        // ATTBONUS_WARRIOR/ASSASSIN/SURA/SHAMAN and RESIST_WARRIOR/ASSASSIN/SURA/SHAMAN
        // (battle.cpp:280-310) are PvP-only (bonus/resist damage vs a specific job's attacks) - wired
        // for when PvP damage lands (PlayerBattle.attack's Player branch is still a TODO stub).
        this.points.set(PointsEnum.ATTBONUS_WARRIOR, {
            get: () => this.attbonusWarrior,
            add: (value) => this.addCommonPoint(value, 'attbonusWarrior'),
        });
        this.points.set(PointsEnum.ATTBONUS_ASSASSIN, {
            get: () => this.attbonusAssassin,
            add: (value) => this.addCommonPoint(value, 'attbonusAssassin'),
        });
        this.points.set(PointsEnum.ATTBONUS_SURA, {
            get: () => this.attbonusSura,
            add: (value) => this.addCommonPoint(value, 'attbonusSura'),
        });
        this.points.set(PointsEnum.ATTBONUS_SHAMAN, {
            get: () => this.attbonusShaman,
            add: (value) => this.addCommonPoint(value, 'attbonusShaman'),
        });
        this.points.set(PointsEnum.RESIST_WARRIOR, {
            get: () => this.resistWarrior,
            add: (value) => this.addCommonPoint(value, 'resistWarrior'),
        });
        this.points.set(PointsEnum.RESIST_ASSASSIN, {
            get: () => this.resistAssassin,
            add: (value) => this.addCommonPoint(value, 'resistAssassin'),
        });
        this.points.set(PointsEnum.RESIST_SURA, {
            get: () => this.resistSura,
            add: (value) => this.addCommonPoint(value, 'resistSura'),
        });
        this.points.set(PointsEnum.RESIST_SHAMAN, {
            get: () => this.resistShaman,
            add: (value) => this.addCommonPoint(value, 'resistShaman'),
        });
        this.points.set(PointsEnum.MANA_BURN_PCT, {
            get: () => this.manaBurnPct,
            add: (value) => this.addCommonPoint(value, 'manaBurnPct'),
        });
        this.points.set(PointsEnum.DAMAGE_SP_RECOVER, {
            get: () => this.damageSpRecover,
            add: (value) => this.addCommonPoint(value, 'damageSpRecover'),
        });
        this.points.set(PointsEnum.RESIST_FIRE, {
            get: () => this.resistFire,
            add: (value) => this.addCommonPoint(value, 'resistFire'),
        });
        this.points.set(PointsEnum.RESIST_ELEC, {
            get: () => this.resistElec,
            add: (value) => this.addCommonPoint(value, 'resistElec'),
        });
        this.points.set(PointsEnum.RESIST_WIND, {
            get: () => this.resistWind,
            add: (value) => this.addCommonPoint(value, 'resistWind'),
        });
        this.points.set(PointsEnum.RESIST_ICE, {
            get: () => this.resistIce,
            add: (value) => this.addCommonPoint(value, 'resistIce'),
        });
        this.points.set(PointsEnum.RESIST_EARTH, {
            get: () => this.resistEarth,
            add: (value) => this.addCommonPoint(value, 'resistEarth'),
        });
        this.points.set(PointsEnum.RESIST_DARK, {
            get: () => this.resistDark,
            add: (value) => this.addCommonPoint(value, 'resistDark'),
        });
        this.points.set(PointsEnum.REFLECT_CURSE, {
            get: () => this.reflectCurse,
            add: (value) => this.addCommonPoint(value, 'reflectCurse'),
        });
        this.points.set(PointsEnum.KILL_SP_RECOVER, {
            get: () => this.killSpRecover,
            add: (value) => this.addCommonPoint(value, 'killSpRecover'),
        });
        this.points.set(PointsEnum.GOLD_DOUBLE_BONUS, {
            get: () => this.goldDoubleBonus,
            add: (value) => this.addCommonPoint(value, 'goldDoubleBonus'),
        });
        this.points.set(PointsEnum.KILL_HP_RECOVERY, {
            get: () => this.killHpRecovery,
            add: (value) => this.addCommonPoint(value, 'killHpRecovery'),
        });
        this.points.set(PointsEnum.IMMUNE_SLOW, {
            get: () => this.immuneSlow,
            add: (value) => this.addCommonPoint(value, 'immuneSlow'),
        });
        this.points.set(PointsEnum.IMMUNE_FALL, {
            get: () => this.immuneFall,
            add: (value) => this.addCommonPoint(value, 'immuneFall'),
        });
        // PARTY_TANKER_BONUS/PARTY_SKILL_MASTER_BONUS: flat additions folded into max HP/SP on every
        // recompute (char.cpp:3162,3179), unlike the *_PCT points which are percentages.
        this.points.set(PointsEnum.PARTY_TANKER_BONUS, {
            get: () => this.partyTankerBonus,
            add: (value) => this.addCommonPoint(value, 'partyTankerBonus'),
            afterAddHooks: () => [this.calcMaxHealth],
        });
        this.points.set(PointsEnum.PARTY_BUFFER_BONUS, {
            get: () => this.partyBufferBonus,
            add: (value) => this.addCommonPoint(value, 'partyBufferBonus'),
        });
        this.points.set(PointsEnum.PARTY_SKILL_MASTER_BONUS, {
            get: () => this.partySkillMasterBonus,
            add: (value) => this.addCommonPoint(value, 'partySkillMasterBonus'),
            afterAddHooks: () => [this.calcMaxMana],
        });
        this.points.set(PointsEnum.HP_RECOVER_CONTINUE, {
            get: () => this.hpRecoverContinue,
            add: (value) => this.addCommonPoint(value, 'hpRecoverContinue'),
        });
        this.points.set(PointsEnum.SP_RECOVER_CONTINUE, {
            get: () => this.spRecoverContinue,
            add: (value) => this.addCommonPoint(value, 'spRecoverContinue'),
        });
        this.points.set(PointsEnum.PARTY_HASTE_BONUS, {
            get: () => this.partyHasteBonus,
            add: (value) => this.addCommonPoint(value, 'partyHasteBonus'),
        });
        this.points.set(PointsEnum.PARTY_DEFENDER_BONUS, {
            get: () => this.partyDefenderBonus,
            add: (value) => this.addCommonPoint(value, 'partyDefenderBonus'),
        });
        this.points.set(PointsEnum.STAT_RESET_COUNT, {
            get: () => this.statResetCount,
            add: (value) => this.addCommonPoint(value, 'statResetCount'),
            set: (value) => (this.statResetCount = value),
        });
        this.points.set(PointsEnum.MALL_DEFBONUS, {
            get: () => this.mallDefbonus,
            add: (value) => this.addCommonPoint(value, 'mallDefbonus'),
        });
        this.points.set(PointsEnum.MALL_EXPBONUS, {
            get: () => this.mallExpbonus,
            add: (value) => this.addCommonPoint(value, 'mallExpbonus'),
        });
        this.points.set(PointsEnum.MALL_GOLDBONUS, {
            get: () => this.mallGoldbonus,
            add: (value) => this.addCommonPoint(value, 'mallGoldbonus'),
        });
        // MAX_SP_PCT: same fold-in as MAX_HP_PCT, capped at 800 (char.cpp:3177).
        this.points.set(PointsEnum.MAX_SP_PCT, {
            get: () => this.maxSpPct,
            add: (value) => this.addCommonPoint(value, 'maxSpPct'),
            afterAddHooks: () => [this.calcMaxMana],
        });
        this.points.set(PointsEnum.PC_BANG_EXP_BONUS, {
            get: () => this.pcBangExpBonus,
            add: (value) => this.addCommonPoint(value, 'pcBangExpBonus'),
        });
        this.points.set(PointsEnum.PC_BANG_DROP_BONUS, {
            get: () => this.pcBangDropBonus,
            add: (value) => this.addCommonPoint(value, 'pcBangDropBonus'),
        });
        this.points.set(PointsEnum.RAMADAN_CANDY_BONUS_EXP, {
            get: () => this.ramadanCandyBonusExp,
            add: (value) => this.addCommonPoint(value, 'ramadanCandyBonusExp'),
        });
        this.points.set(PointsEnum.ENERGY, {
            get: () => this.energy,
            add: (value) => this.addCommonPoint(value, 'energy'),
        });
        this.points.set(PointsEnum.ENERGY_END_TIME, {
            get: () => this.energyEndTime,
            add: (value) => this.addCommonPoint(value, 'energyEndTime'),
            set: (value) => (this.energyEndTime = value),
        });
        this.points.set(PointsEnum.COSTUME_ATTR_BONUS, {
            get: () => this.costumeAttrBonus,
            add: (value) => this.addCommonPoint(value, 'costumeAttrBonus'),
        });
        // RESIST_CRITICAL/RESIST_PENETRATE (char_battle.cpp:1681,1728,1822,1854): subtracted from the
        // ATTACKER's own crit/penetrate chance when this player is the victim - see
        // MonsterBattle.calculateCriticalDamage/calculatePenetrateDamage.
        this.points.set(PointsEnum.RESIST_CRITICAL, {
            get: () => this.resistCritical,
            add: (value) => this.addCommonPoint(value, 'resistCritical'),
        });
        this.points.set(PointsEnum.RESIST_PENETRATE, {
            get: () => this.resistPenetrate,
            add: (value) => this.addCommonPoint(value, 'resistPenetrate'),
        });
    }

    private addCommonPoint(value: number, pointName: string, maxValue?: number) {
        const currentValue = (this as Record<string, any>)[pointName];
        if (currentValue === undefined || currentValue === null || typeof currentValue !== 'number')
            throw new Error(`The field ${pointName} is invalid on Points`);

        (this as Record<string, any>)[pointName] = MathUtil.minMax(
            0,
            currentValue + value,
            maxValue || MathUtil.MAX_UINT,
        );
    }

    calcPolymorphPoint(pointName: 'ht' | 'st' | 'dx' | 'iq'): number {
        if (!this.player.isAffectByFlag(AffectBitsTypeEnum.POLYMORPH)) return this[pointName];
        const mobProto = this.mobManager.getMobProto(this.player.getPolymorphVnum());
        if (!mobProto) return this[pointName];
        return Math.min(255, this[pointName] + Number(mobProto[pointName] || 0));
    }

    calcPointsAndResetValues() {
        this.calcMaxHealth();
        this.calcMaxMana();
        this.calcStatusPoints();
        this.calcAttack();
        this.calcMagicAttack();
        this.calcDefense();
        this.calcMagicDefense();
        this.resetHealth();
        this.resetMana();
        this.calcPoints();
        this.resetAttackSpeed();
        this.resetMoveSpeed();
    }

    calcPoints() {
        this.calcMaxHealth();
        this.calcMaxMana();
        this.calcStatusPoints();
        this.calcAttack();
        this.calcMagicAttack();
        this.calcDefense();
        this.calcMagicDefense();
    }

    private addHealth(value: number) {
        this.health = Math.max(0, Math.min(this.health + value, this.maxHealth));
    }

    private addMana(value: number) {
        this.mana = Math.max(0, Math.min(this.mana + value, this.maxMana));
    }

    private addGold(value: number = 1) {
        const validatedValue = MathUtil.toNumber(value);
        if (validatedValue === 0) return;

        this.gold = Math.min(this.gold + validatedValue, MathUtil.MAX_UINT);
    }

    private addExperience(value: number): void {
        const validatedValue = MathUtil.toUnsignedNumber(value);

        if (validatedValue < 0 || (this.level >= this.config.MAX_LEVEL && this.experience === 0)) return;

        if (this.level >= this.config.MAX_LEVEL) {
            this.experience = 0;
            this.calcStatusPoints();
            return;
        }

        const expNeeded = this.experienceManager.getNeededExperience(this.level);

        if (this.experience + validatedValue >= expNeeded) {
            const diff = this.experience + validatedValue - expNeeded;
            this.experience = diff;
            this.addLevel(1);
            this.calcStatusPoints();
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
            this.calcStatusPoints();
        }
    }

    private calcStatusPoints() {
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

    private addStat(stat: StatsEnum, value = 1) {
        if (![StatsEnum.ST, StatsEnum.HT, StatsEnum.DX, StatsEnum.IQ].includes(stat)) return;
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue === 0 || validatedValue > this.availableStatusPoints) return;

        const realValue =
            this[stat] + validatedValue > this.config.MAX_POINTS ? this.config.MAX_POINTS - this[stat] : validatedValue;

        this[stat] += realValue;
        this.givenStatusPoints += realValue;
        this.availableStatusPoints -= realValue;
    }

    private addLevel(value: number) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (this.level + validatedValue > this.config.MAX_LEVEL) return;
        if (validatedValue < 1) return;

        if (this.player.getSkillGroup() > 0) {
            this.addPoint(PointsEnum.SKILL, 1);
        }

        this.level += validatedValue;
        this.player.levelUp();
    }

    private setLevel(value: number = 1) {
        const validatedValue = MathUtil.toUnsignedNumber(value);
        if (validatedValue < 1 || validatedValue > this.config.MAX_LEVEL) return;

        this.level = validatedValue;

        this.givenStatusPoints = 0;
        this.availableStatusPoints = 0;
        this.experience = 0;
        const className = JobUtil.getClassNameFromClassId(this.player.getPlayerClass());
        this.st = this.config.jobs[className].common.st;
        this.ht = this.config.jobs[className].common.ht;
        this.dx = this.config.jobs[className].common.dx;
        this.iq = this.config.jobs[className].common.iq;

        if (this.player.getSkillGroup() > 0) {
            this.addPoint(
                PointsEnum.SKILL,
                4 + (this.getPoint(PointsEnum.LEVEL) - 5) - this.getPoint(PointsEnum.SKILL),
            );
        }
        this.addPoint(PointsEnum.SUB_SKILL, value < 10 ? 0 : Math.max(this.level, 9));

        this.calcPointsAndResetValues();
        this.player.levelUp();
    }

    private calcAttack() {
        const st = this.getEffectiveStat(PointsEnum.ST);
        const dx = this.getEffectiveStat(PointsEnum.DX);
        const iq = this.getEffectiveStat(PointsEnum.IQ);
        let attack =
            this.level * 2 + this.attackPerStPoint * st + this.attackPerIqPoint * iq + this.attackPerDxPoint * dx;
        const { physic } = this.player.getWeaponValues();
        attack += MathUtil.getRandomInt(physic.min, physic.max) * 2;
        attack += physic.bonus * 2;
        // iAtk += GetPoint(POINT_ATT_GRADE_BONUS) (char.cpp:2056): folds the persistent aura/item
        // bonus back into the freshly recomputed base every time, so it survives a stat/gear change.
        // attackBonus (POINT_ATT_BONUS) is NOT folded in here - the original only ever applies it as a
        // battle-time percentage multiplier (battle.cpp:453,571), never a flat term in ComputePoints;
        // adding it here too used to double-count it on top of that multiplier.
        attack += this.attGradeBonus;
        this.attackGrade = Math.floor(attack);
    }

    private calcMagicAttack() {
        const iq = this.getEffectiveStat(PointsEnum.IQ);
        let magicAttack = this.level * 2 + 2 * iq;
        magicAttack += this.magicAttGradeBonus;
        const { magic } = this.player.getWeaponValues();
        magicAttack += MathUtil.getRandomInt(magic.min, magic.max) * 2;
        magicAttack += magic.bonus * 2;
        this.magicAttGrade = Math.floor(magicAttack);
    }

    private calcDefense() {
        const ht = this.getEffectiveStat(PointsEnum.HT);
        let defense = this.level + Math.floor(this.defensePerHtPoint * ht);
        const armorValues = this.player.getArmorValues();
        armorValues.forEach(({ flat, multi }) => {
            defense += flat;
            defense += multi * 2;
        });
        // iArmor += GetPoint(POINT_DEF_GRADE_BONUS) (char.cpp:2091): same fold-in as calcAttack.
        defense += this.defGradeBonus;
        this.defense = this.defenseGrade = Math.floor(defense);
    }

    private calcMagicDefense() {
        this.calcDefense();
        const iq = this.getEffectiveStat(PointsEnum.IQ);
        const ht = this.getEffectiveStat(PointsEnum.HT);
        let magicDefense = this.level + (iq * 3 + ht / 3 + this.defense / 2);
        magicDefense += this.magicDefGradeBonus;
        this.magicDefGrade = Math.floor(magicDefense);
    }

    private calcMaxHealth() {
        const ht = this.getEffectiveStat(PointsEnum.HT);
        const baseMaxHealth = this.baseHealth + ht * this.hpPerHtPoint + this.level * this.hpPerLvl;
        // add_hp = min(3500, hp * GetPoint(POINT_MAX_HP_PCT) / 100) + GetPoint(POINT_PARTY_TANKER_BONUS)
        // (char.cpp:3159-3162).
        const maxHpPctBonus = Math.min(3500, (baseMaxHealth * this.maxHpPct) / 100);
        this.maxHealth = baseMaxHealth + maxHpPctBonus + this.partyTankerBonus + this.maxHealthBonus;
    }

    private resetHealth() {
        this.health = this.maxHealth;
    }

    private resetMana() {
        this.mana = this.maxMana;
    }

    private calcMaxMana() {
        const iq = this.getEffectiveStat(PointsEnum.IQ);
        const baseMaxMana = this.baseMana + iq * this.mpPerIqPoint + this.level * this.mpPerLvl;
        // add_sp = min(800, sp * GetPoint(POINT_MAX_SP_PCT) / 100) + GetPoint(POINT_PARTY_SKILL_MASTER_BONUS)
        // (char.cpp:3176-3179).
        const maxSpPctBonus = Math.min(800, (baseMaxMana * this.maxSpPct) / 100);
        this.maxMana = baseMaxMana + maxSpPctBonus + this.partySkillMasterBonus + this.maxManaBonus;
    }

    private getEffectiveStat(point: PointsEnum): number {
        const isRiding = this.player.isHorseRiding();

        if (isRiding) {
            const horse = HORSE_STATS[this.player.getHorseLevel()];
            return this.getBaseStat(horse, point);
        }

        return this.calcPolymorphPoint(this.getStatName(point));
    }

    private getStatName(point: PointsEnum): StatsEnum {
        switch (point) {
            case PointsEnum.ST:
                return StatsEnum.ST;
            case PointsEnum.DX:
                return StatsEnum.DX;
            case PointsEnum.IQ:
                return StatsEnum.IQ;
            case PointsEnum.HT:
            default:
                return StatsEnum.HT;
        }
    }

    getPersistedStat(point: PointsEnum): number {
        return this[this.getStatName(point)];
    }

    private getBaseStat(target: StatPoints, point: PointsEnum): number {
        switch (point) {
            case PointsEnum.ST:
                return target.st;
            case PointsEnum.DX:
                return target.dx;
            case PointsEnum.HT:
                return target.ht;
            case PointsEnum.IQ:
                return target.iq;
            default:
                return 0;
        }
    }

    private resetMoveSpeed() {
        this.moveSpeed = this.baseMovementSpeed;
    }

    private resetAttackSpeed() {
        this.attackSpeed = this.baseAttackSpeed;
    }

    getGivenStatusPoints() {
        return this.givenStatusPoints;
    }
}
