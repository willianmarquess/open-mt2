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
    private mana: number;
    private maxMana: number;
    private readonly stamina: number;
    private readonly maxStamina: number;
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
    private readonly statResetCount: number;
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
    private readonly energyEndTime: number;
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
            skill = 0,
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
            get: () => this.attackGrade,
        });
        this.points.set(PointsEnum.ATTACK_BONUS, {
            get: () => this.attackBonus,
            add: (value) => this.addCommonPoint(value, 'attackBonus'),
            afterAddHooks: () => [this.calcAttack],
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
        });
        this.points.set(PointsEnum.DEFENSE_BONUS, {
            get: () => this.defenseBonus,
            add: (value) => this.addCommonPoint(value, 'defenseBonus'),
            afterAddHooks: () => [this.calcDefense],
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
            add: (value) => this.addCommonPoint(value, 'attackSpeed'),
        });
        this.points.set(PointsEnum.MOVE_SPEED, {
            get: () => this.moveSpeed,
            add: (value) => this.addCommonPoint(value, 'moveSpeed'),
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
        });
        this.points.set(PointsEnum.MANA, {
            get: () => this.mana,
            add: (value) => this.addMana(value),
        });
        this.points.set(PointsEnum.MAX_MANA, {
            get: () => this.maxMana,
        });
        this.points.set(PointsEnum.PLAY_TIME, {
            get: () => this.playTime,
        });
        this.points.set(PointsEnum.STAMINA, {
            get: () => this.stamina,
        });
        this.points.set(PointsEnum.RESIST_SWORD, {
            get: () => this.resistSword,
        });
        this.points.set(PointsEnum.RESIST_TWOHAND, {
            get: () => this.resistTwohand,
        });
        this.points.set(PointsEnum.RESIST_DAGGER, {
            get: () => this.resistDagger,
        });
        this.points.set(PointsEnum.RESIST_BELL, {
            get: () => this.resistBell,
        });
        this.points.set(PointsEnum.RESIST_FAN, {
            get: () => this.resistFan,
        });
        this.points.set(PointsEnum.RESIST_BOW, {
            get: () => this.resistBow,
        });
        this.points.set(PointsEnum.REFLECT_MELEE, {
            get: () => this.reflectMelee,
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
    }

    private addCommonPoint(value: number, pointName: string) {
        const currentValue = (this as Record<string, any>)[pointName];
        if (currentValue === undefined || currentValue === null || typeof currentValue !== 'number')
            throw new Error(`The field ${pointName} is invalid on Points`);

        (this as Record<string, any>)[pointName] = Math.max(0, currentValue + value);
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
            this.addPoint(PointsEnum.SKILL, this.level >= 5 ? 1 : 0);
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

        this.addPoint(PointsEnum.SKILL, 4 + (this.getPoint(PointsEnum.LEVEL) - 5) - this.getPoint(PointsEnum.SKILL));
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
        attack += this.attackBonus;
        const { physic } = this.player.getWeaponValues();
        attack += MathUtil.getRandomInt(physic.min, physic.max) * 2;
        attack += physic.bonus * 2;
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
        this.maxHealth = this.baseHealth + ht * this.hpPerHtPoint + this.level * this.hpPerLvl;
    }

    private resetHealth() {
        this.health = this.maxHealth;
    }

    private resetMana() {
        this.mana = this.maxMana;
    }

    private calcMaxMana() {
        const iq = this.getEffectiveStat(PointsEnum.IQ);
        this.maxMana = this.baseMana + iq * this.mpPerIqPoint + this.level * this.mpPerLvl;
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
