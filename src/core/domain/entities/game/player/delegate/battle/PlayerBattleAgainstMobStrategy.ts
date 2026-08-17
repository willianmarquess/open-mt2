import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemSubTypeEnum } from '@/core/enum/ItemSubTypeEnum';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { MobImmuneFlagEnum } from '@/core/enum/MobImmuneFlagEnum';
import BitFlag from '@/core/util/BitFlag';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';
import { MobResistEnum } from '@/core/enum/MobResistEnum';
import { ItemWeaponSubTypeEnum } from '@/core/enum/ItemWeaponSubTypeEnum';
import { MobRaceFlagEnum } from '@/core/enum/MobRaceFlagEnum';
import Monster from '../../../mob/Monster';
import Stone from '../../../mob/Stone';
import Player from '../../Player';
import MathUtil from '@/core/domain/util/MathUtil';
import { FlyEnum } from '@/core/enum/FlyEnum';
import PlayerBattleStrategy from './PlayerBattleStrategy';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';

const weaponResistanceMapper: { [key in ItemWeaponSubTypeEnum]: MobResistEnum } = {
    [ItemWeaponSubTypeEnum.WEAPON_BELL]: MobResistEnum.BELL,
    [ItemWeaponSubTypeEnum.WEAPON_DAGGER]: MobResistEnum.DAGGER,
    [ItemWeaponSubTypeEnum.WEAPON_FAN]: MobResistEnum.FAN,
    [ItemWeaponSubTypeEnum.WEAPON_SWORD]: MobResistEnum.SWORD,
    [ItemWeaponSubTypeEnum.WEAPON_TWO_HANDED]: MobResistEnum.TWOHAND,
    [ItemWeaponSubTypeEnum.WEAPON_BOW]: MobResistEnum.BOW,
    [ItemWeaponSubTypeEnum.WEAPON_MOUNT_SPEAR]: MobResistEnum.SWORD,
    [ItemWeaponSubTypeEnum.WEAPON_ARROW]: MobResistEnum.BOW,
};

const MAX_DISTANCE = 300;
const MOB_ATTACK_RANGE_TOLERANCE = 1.15;

/**
 * A metin stone takes normal-attack damage through the exact same CHARACTER::Damage/battle_hit
 * pipeline as a monster in the original (char_battle.cpp:1556, battle.cpp:620) - crit, penetrate,
 * resistances, weapon-type resist and HP steal (POINT_STEAL_HP, char_battle.cpp:1866-1882) all apply
 * unconditionally there, keyed off the ATTACKER's own points, with no IsStone() branch anywhere in
 * that function. The one deliberate difference here is status effects (poison/stun/slow/fire), which
 * this port skips for stones - they don't have the client-visible affect feedback these rely on
 * (Monster.sendUpdateEvent()).
 */
export type AttackableMob = Monster | Stone;

export default class PlayerBattleAgainstMobStrategy extends PlayerBattleStrategy<AttackableMob> {
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        super(player);
        this.logger = logger;
    }

    execute(attackType: AttackTypeEnum, victim: AttackableMob) {
        if (attackType === AttackTypeEnum.NORMAL) {
            //we need to verify the battle type before to do this
            this.meleeAttack(victim);
        } else {
            this.logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
        }
    }

    /**
     * ignoreDefense is the result of a skill's own PENETRATE roll (SkillFlagsEnum.PENETRATE). Mirrors
     * the original's `if (!bIgnoreDefense) iDam -= pkChrVictim->GetPoint(POINT_DEF_GRADE)` - only
     * applied for MELEE, since the original never subtracts raw defense for RANGE/MAGIC skill damage.
     */
    private calculateSkillDamage(
        damage: number,
        damageType: DamageTypeEnum,
        damageFlags: BitFlag,
        victim: AttackableMob,
        ignoreDefense: boolean = false,
    ): number {
        const isSkillDamage = [
            DamageTypeEnum.MELEE,
            DamageTypeEnum.RANGE,
            DamageTypeEnum.FIRE,
            DamageTypeEnum.ICE,
            DamageTypeEnum.ELEC,
            DamageTypeEnum.MAGIC,
        ].includes(damageType);
        if (!isSkillDamage) return damage;

        if (damageType === DamageTypeEnum.MELEE && !ignoreDefense) {
            damage -= victim.getDefense();
        }

        damage = this.calculateMagicAttackBonus(damage, damageType);
        damage = this.calculateCriticalDamage(damage, damageFlags);
        damage = this.calculatePenetrateDamage(damage, damageFlags, victim);
        damage = this.calculateSkillDamageBonus(damage, victim);

        //validate
        damage = this.calculateWeaponDamageResistance(damage, victim);

        return damage;
    }

    private calculatePoisonDamage(
        damage: number,
        damageType: DamageTypeEnum,
        damageFlags: BitFlag,
        victim: AttackableMob,
    ): number {
        const isPoisonDamage = damageType === DamageTypeEnum.POISON;
        if (!isPoisonDamage) return damage;

        damageFlags.set(DamageFlagEnum.POISON);
        damage -= damage * (victim.getResist(MobResistEnum.POISON) / 100);

        return damage;
    }

    private calculateNormalDamage(
        damage: number,
        damageType: DamageTypeEnum,
        damageFlags: BitFlag,
        victim: AttackableMob,
    ): number {
        const isNormalDamage = [DamageTypeEnum.NORMAL, DamageTypeEnum.NORMAL_RANGE].includes(damageType);
        if (!isNormalDamage) return damage;

        damageFlags.set(DamageFlagEnum.NORMAL);

        damage = this.calculateCriticalDamage(damage, damageFlags);
        damage = this.calculatePenetrateDamage(damage, damageFlags, victim);
        this.calculateAndSendHealthSteal(damage, victim);
        this.calculateAndSendManaSteal(damage, victim);
        this.calculateAndSendGoldSteal(victim);
        this.calculateAndSendHealthHitRecovery(damage, victim);
        this.calculateAndSendManaHitRecovery(damage, victim);

        damage = this.calculateWeaponDamageResistance(damage, victim);

        //TODO: mana burn (pvp only)
        this.calculateAndApplyDrainSp(victim);

        damage = this.calculateNormalDamageBonus(damage, victim);
        damage = this.calculateMallAttackBonus(damage);
        damage = this.calculateStoneSkinner(damage, victim);

        return damage;
    }

    /** Public so the skill engine (PlayerSkill.computeSkill) can deal skill damage through the same pipeline as normal attacks. */
    applyDamage(damage: number, damageType: DamageTypeEnum, victim: AttackableMob, ignoreDefense: boolean = false) {
        const damageFlags = new BitFlag();

        switch (damageType) {
            case DamageTypeEnum.POISON:
                damage = this.calculatePoisonDamage(damage, damageType, damageFlags, victim);
                break;
            case DamageTypeEnum.NORMAL:
            case DamageTypeEnum.NORMAL_RANGE:
                damage = this.calculateNormalDamage(damage, damageType, damageFlags, victim);
                break;
            case DamageTypeEnum.MELEE:
            case DamageTypeEnum.RANGE:
            case DamageTypeEnum.FIRE:
            case DamageTypeEnum.ICE:
            case DamageTypeEnum.ELEC:
            case DamageTypeEnum.MAGIC:
                damage = this.calculateSkillDamage(damage, damageType, damageFlags, victim, ignoreDefense);
                break;
        }

        damage = damage > 0 ? Math.round(damage) : MathUtil.getRandomInt(1, 5);

        this.attacker.debugChat(`your damage is: ${damage}`);

        this.attacker.sendDamageCaused({
            virtualId: victim.getVirtualId(),
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        victim.takeDamage(this.attacker, damage);
    }

    private meleeAttack(victim: AttackableMob) {
        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );

        const maxDistance =
            victim.getBattleType() === BattleTypeEnum.MELEE
                ? Math.max(MAX_DISTANCE, victim.getAttackRange() * MOB_ATTACK_RANGE_TOLERANCE)
                : MAX_DISTANCE;

        if (distance > maxDistance) {
            this.logger.info(`[PlayerBattle] Very far from the victim.`);
            return;
        }

        const weapon = this.attacker.getWeapon();

        if (weapon?.getType() === ItemTypeEnum.ITEM_WEAPON) {
            switch (weapon.getSubType()) {
                case ItemSubTypeEnum.WEAPON_SWORD:
                case ItemSubTypeEnum.WEAPON_DAGGER:
                case ItemSubTypeEnum.WEAPON_TWO_HANDED:
                case ItemSubTypeEnum.WEAPON_BELL:
                case ItemSubTypeEnum.WEAPON_FAN:
                case ItemSubTypeEnum.WEAPON_MOUNT_SPEAR:
                    break;
                case ItemSubTypeEnum.WEAPON_BOW:
                    this.logger.info(`[PlayerBattle] Melee attack cant handle bow attacks.`);
                    return;
                default:
                    this.logger.info(`[PlayerBattle] Invalid weapon subtype: ${weapon.getSubType()}.`);
                    return;
            }
        }

        const attackRating = this.calcAttackRating(victim);

        //calculate attack for polymorph character

        const basePlayerAttack = this.attacker.getAttack();

        // level must be ignored when multiplying by the attack rating (see CalcMeleeDamage)
        const levelAttack = this.attacker.getPoint(PointsEnum.LEVEL) * 2;
        let attack = Math.floor((basePlayerAttack - levelAttack) * attackRating) + levelAttack;
        attack = this.calculateRaceAttackBonus(attack, victim);

        this.applyAttackEffect(victim);

        const defense = victim.getDefense();
        const damage = Math.max(0, attack - defense);

        this.applyDamage(damage, DamageTypeEnum.NORMAL, victim);
    }

    /**
     * The "atk" variable a USE_MELEE_DAMAGE skill's own formula is evaluated with - mirrors
     * CalcMeleeDamage's `iAtk` (weapon roll + refine bonus + attack rating + race bonus). Always
     * computed with defense ignored, matching the original's hardcoded `bIgnoreDefense=true` when
     * this is used to feed a skill formula (defense is subtracted later, once, in
     * calculateSkillDamage, gated by the skill's own PENETRATE roll instead).
     */
    calculateMeleeAttack(victim: AttackableMob, ignoreTargetRating: boolean): number {
        const weapon = this.attacker.getWeapon();
        const weaponValues = this.attacker.getWeaponValues();

        const fAR = this.calcAttackRating(victim, ignoreTargetRating);
        const weaponRoll = MathUtil.getRandomInt(weaponValues.physic.min, weaponValues.physic.max) * 2;

        const levelAttack = this.attacker.getLevel() * 2;
        let atk = this.attacker.getAttack() + weaponRoll - levelAttack;
        atk = atk * fAR;
        atk += levelAttack;

        if (weapon) {
            atk += weaponValues.physic.bonus * 2;
        }

        atk += this.attacker.getPoint(PointsEnum.PARTY_ATTACKER_BONUS);
        atk =
            (atk *
                (100 +
                    this.attacker.getPoint(PointsEnum.ATTACK_BONUS) +
                    this.attacker.getPoint(PointsEnum.MELEE_MAGIC_ATT_BONUS_PER))) /
            100;

        atk = this.calculateRaceAttackBonus(atk, victim);

        return Math.max(0, Math.round(atk));
    }

    /**
     * The "atk" variable a USE_ARROW_DAMAGE skill's own formula is evaluated with - mirrors
     * CalcArrowDamage, including its distance-based falloff (`iPercent`). Unlike melee, the original
     * never lets a skill ignore the target's rating here (CalcAttackRating is always called with
     * bIgnoreTargetRating=false for arrows), so IGNORE_TARGET_RATING has no effect on arrow skills.
     */
    calculateArrowAttack(victim: AttackableMob): number {
        const bow = this.attacker.getWeapon();
        const arrow = this.attacker.getArrow();
        if (!bow || bow.getSubType() !== ItemSubTypeEnum.WEAPON_BOW || !arrow) return 0;

        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );
        const gap = distance / 100 - 5 - this.attacker.getPoint(PointsEnum.BOW_DISTANCE);
        const percent = MathUtil.minMax(0, 100 - gap * 5, 100);
        if (percent <= 0) return 0;

        const bowValues = this.attacker.getWeaponValues();
        const arrowRoll = MathUtil.getRandomInt(bowValues.physic.min, bowValues.physic.max) * 2 + arrow.getValues()[3];

        const fAR = this.calcAttackRating(victim, false);
        const levelAttack = this.attacker.getLevel() * 2;
        let atk = this.attacker.getAttack() + arrowRoll - levelAttack;
        atk = atk * fAR;
        atk += levelAttack;
        atk += bowValues.physic.bonus * 2;

        atk += this.attacker.getPoint(PointsEnum.PARTY_ATTACKER_BONUS);
        atk =
            (atk *
                (100 +
                    this.attacker.getPoint(PointsEnum.ATTACK_BONUS) +
                    this.attacker.getPoint(PointsEnum.MELEE_MAGIC_ATT_BONUS_PER))) /
            100;

        atk = this.calculateRaceAttackBonus(atk, victim);

        return Math.round((Math.max(0, atk) * percent) / 100);
    }

    private calculateSkillDamageBonus(damage: number, victim: AttackableMob): number {
        const normalHitDamageBonus = this.attacker.getPoint(PointsEnum.SKILL_DAMAGE_BONUS);

        if (normalHitDamageBonus > 0) {
            damage *= (100 + normalHitDamageBonus) / 100;
        }

        damage *= (100 - Math.min(99, victim.getPoint(PointsEnum.SKILL_DEFEND_BONUS))) / 100; //TODO: this line of code will be used only for PVP, we will reuse this for inheritance later

        return Math.round(damage);
    }

    private calculateMagicAttackBonus(damage: number, damageType: DamageTypeEnum): number {
        if (damageType === DamageTypeEnum.MAGIC) {
            const magicAttackBonus = this.attacker.getPoint(PointsEnum.MAGIC_ATT_BONUS_PER);
            const meleeMagicAttackBonus = this.attacker.getPoint(PointsEnum.MELEE_MAGIC_ATT_BONUS_PER);
            damage *= (100 + magicAttackBonus + meleeMagicAttackBonus) / 100 + 0.5;
        }

        return Math.round(damage);
    }

    private calculateStoneSkinner(damage: number, victim: AttackableMob): number {
        if (victim.isStoneSkinner()) {
            if (victim.getHealthPercentage() < victim.getHpPercentToGetStoneSkin()) {
                this.attacker.debugChat(`[STONE_SKINNER] Your damage was reduced from ${damage} to ${damage / 2}`);
                damage /= 2;
            }
        }

        return Math.round(damage);
    }

    private calculateMallAttackBonus(damage: number) {
        const mallAttackBonus = this.attacker.getPoint(PointsEnum.MALL_ATTBONUS);

        if (mallAttackBonus > 0) {
            damage += Math.min(300, damage * (mallAttackBonus / 100));
        }

        return Math.round(damage);
    }

    private calculateNormalDamageBonus(damage: number, victim: AttackableMob) {
        const normalHitDamageBonus = this.attacker.getPoint(PointsEnum.NORMAL_HIT_DAMAGE_BONUS);

        if (normalHitDamageBonus > 0) {
            damage *= (100 + normalHitDamageBonus) / 100;
        }

        damage *= (100 - Math.min(99, victim.getPoint(PointsEnum.NORMAL_HIT_DEFEND_BONUS))) / 100; //TODO: this line of code will be used only for PVP, we will reuse this for inheritance later

        return Math.round(damage);
    }

    private calculateAndApplyDrainSp(victim: AttackableMob) {
        const drainSp = victim.getDrainSp();
        const manaPoints = this.attacker.getPoint(PointsEnum.MANA);

        if (drainSp) {
            if (drainSp <= manaPoints) {
                this.attacker.addPoint(PointsEnum.MANA, -drainSp);
                return;
            }

            this.attacker.addPoint(PointsEnum.MANA, -manaPoints);
        }
    }

    private calculateWeaponDamageResistance(damage: number, victim: AttackableMob): number {
        const attackerWeapon = this.attacker.getWeapon();
        if (!attackerWeapon) return damage;

        const resistanceType: MobResistEnum =
            weaponResistanceMapper[attackerWeapon.getSubType() as ItemWeaponSubTypeEnum];
        if (resistanceType >= 0) {
            return this.applyResistance(damage, victim.getResist(resistanceType));
        }

        return Math.round(damage);
    }

    private calculateAndSendGoldSteal(victim: AttackableMob) {
        const attackerStealGoldChance = this.attacker.getPoint(PointsEnum.STEAL_GOLD);

        if (MathUtil.getRandomInt(1, 100) <= attackerStealGoldChance) {
            //TODO: add gold bonus do multiply this
            const amount = MathUtil.getRandomInt(1, victim.getPoint(PointsEnum.LEVEL) * 50);
            this.attacker.addPoint(PointsEnum.GOLD, amount);
            this.attacker.debugChat(`[GOLD_STEAL] You received ${amount} of gold`);
        }
    }

    private calculateRaceAttackBonus(attack: number, victim: AttackableMob) {
        switch (true) {
            case victim.isRaceByFlag(MobRaceFlagEnum.ANIMAL):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_ANIMAL) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.UNDEAD):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_UNDEAD) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.DEVIL):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_DEVIL) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.HUMAN):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_HUMAN) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.ORC):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_ORC) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.MILGYO):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_MILGYO) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.INSECT):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_INSECT) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.FIRE):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_FIRE) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.ICE):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_ICE) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.DESERT):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_DESERT) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.TREE):
                attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_TREE) / 100);
                break;
        }

        attack += attack * (this.attacker.getPoint(PointsEnum.ATTBONUS_MONSTER) / 100);

        return Math.floor(attack);
    }

    /** Public so the skill engine (PlayerSkill.computeSkill) can trigger the same on-hit status effects skills declare via a STATUS apply. */
    /**
     * damagePerTick/durationMs are overridable because skill-triggered fire (e.g. Shooting Dragon,
     * Dragon Roar) carries its own damage and duration formula, unlike the fixed 5%-of-max-health
     * used by on-hit equipment procs.
     */
    applyFire(victim: AttackableMob, damagePerTick?: number, durationMs: number = 10_000) {
        // Status effects need the client-visible affect feedback only Monster has
        // (sendUpdateEvent()) - a stone doesn't burn/poison/stun/slow in this port.
        if (!(victim instanceof Monster)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.FIRE)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.FIRE);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: TimedEventsEnum.FIRE,
            eventFunction: () => {
                const damage = damagePerTick ?? victim.getPoint(PointsEnum.MAX_HEALTH) * 0.05;
                this.applyDamage(damage, DamageTypeEnum.FIRE, victim);
            },
            options: {
                interval: 1_000,
                duration: durationMs,
            },
            onEndEventFunction: () => {
                victim.removeAffectFlag(AffectBitsTypeEnum.FIRE);
                victim.sendUpdateEvent();
            },
        });
    }

    applyPoison(victim: AttackableMob) {
        if (!(victim instanceof Monster)) return;
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.POISON)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.POISON);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: TimedEventsEnum.POISON,
            eventFunction: () => {
                const damage = victim.getPoint(PointsEnum.MAX_HEALTH) * 0.03;
                this.applyDamage(damage, DamageTypeEnum.POISON, victim);
            },
            options: {
                interval: 1_000,
                duration: 20_000,
            },
            onEndEventFunction: () => {
                victim.removeAffectFlag(AffectBitsTypeEnum.POISON);
                victim.sendUpdateEvent();
            },
        });
    }

    /**
     * Public so the skill engine (PlayerSkill.computeSkill) can trigger this. durationMs is
     * overridable because skill-triggered stuns (e.g. Stump) carry their own duration formula,
     * unlike the fixed one used by on-hit equipment procs.
     */
    applyStun(victim: AttackableMob, durationMs: number = 5_000) {
        if (!(victim instanceof Monster)) return;
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.STUN)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        victim.stun();

        victim.addEventTimer({
            id: TimedEventsEnum.STUN,
            eventFunction: () => {
                victim.removeStun();
            },
            options: {
                interval: durationMs,
                duration: durationMs,
                repeatCount: 1,
            },
        });
    }

    /**
     * Public so the skill engine (PlayerSkill.computeSkill) can trigger this. durationMs is
     * overridable because skill-triggered slows (e.g. Shockwave) carry their own duration formula,
     * unlike the fixed one used by on-hit equipment procs.
     */
    applySlow(victim: AttackableMob, durationMs: number = 10_000) {
        if (!(victim instanceof Monster)) return;
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.SLOW)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        victim.addPoint(PointsEnum.MOVE_SPEED, -SLOW_VALUE);

        victim.setAffectFlag(AffectBitsTypeEnum.SLOW);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: TimedEventsEnum.SLOW,
            eventFunction: () => {
                victim.addPoint(PointsEnum.MOVE_SPEED, SLOW_VALUE);
                victim.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                victim.sendUpdateEvent();
            },
            options: {
                interval: durationMs,
                duration: durationMs,
                repeatCount: 1,
            },
        });
    }

    protected calculateCriticalDamage(damage: number, damageFlags: BitFlag): number {
        const criticalChance = this.attacker.getPoint(PointsEnum.CRITICAL_CHANCE);
        if (MathUtil.getRandomInt(1, 100) <= criticalChance) {
            damage *= 2;
            damageFlags.set(DamageFlagEnum.CRITICAL);
            this.attacker.debugChat(`[CRIT_DAMAGE] You deal ${Math.round(damage / 2)} extra damage as critical`);
        }

        return Math.round(damage);
    }

    protected calculatePenetrateDamage(damage: number, damageFlags: BitFlag, victim: AttackableMob): number {
        const penetrateChance = this.attacker.getPoint(PointsEnum.PENETRATE_CHANCE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += victim.getDefense();
            damageFlags.set(DamageFlagEnum.PENETRATE);
            this.attacker.debugChat(`[PENETRATE_DAMAGE] You deal ${victim.getDefense()} extra damage as penetrate`);
        }
        return Math.round(damage);
    }

    /** Mirrors POINT_STEAL_HP (char_battle.cpp:1866-1882): applies to any victim, no IsStone()/IsPC() check in the original. */
    protected calculateAndSendHealthSteal(damage: number, victim: AttackableMob) {
        const attackerStealHealthValue = this.attacker.getPoint(PointsEnum.STEAL_HEALTH);

        if (attackerStealHealthValue > 0) {
            const stealHealthChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealHealthChance) {
                //I do not know why this is fixed in 10% (maybe because this is broken)
                const healthDamage = Math.round(
                    (Math.min(damage, Math.max(0, victim.getPoint(PointsEnum.HEALTH))) * attackerStealHealthValue) /
                        100,
                );

                victim.takeDamage(this.attacker, healthDamage);
                this.attacker.addPoint(PointsEnum.HEALTH, healthDamage);

                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.HEALTH_BIG);
                this.attacker.debugChat(`[HEALTH_STEAL] You received ${healthDamage} of health
                    `);
            }
        }
    }

    /**
     * Mirrors POINT_STEAL_SP (char_battle.cpp:1884-1909): the attacker always gains SP, but the
     * victim is only ever debited `if (IsPC())` - a Monster/Stone victim (never a PC in this
     * codebase yet, PvP isn't implemented) uses its own HP as the steal basis instead of SP, and
     * keeps every point of it. No IsStone() distinction here either - Monster gets the exact same
     * treatment.
     */
    protected calculateAndSendManaSteal(damage: number, victim: AttackableMob) {
        const attackerStealManaValue = this.attacker.getPoint(PointsEnum.STEAL_MANA);

        if (attackerStealManaValue > 0) {
            const stealManaChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealManaChance) {
                const manaDamage = Math.round(
                    (Math.min(damage, Math.max(0, victim.getPoint(PointsEnum.HEALTH))) * attackerStealManaValue) / 100,
                );

                this.attacker.addPoint(PointsEnum.MANA, manaDamage);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);

                this.attacker.debugChat(`[MANA_STEAL] You received ${manaDamage} of mana`);
            }
        }
    }

    protected calculateAndSendHealthHitRecovery(damage: number, victim: AttackableMob) {
        const attackerHitHealthRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_HEALTH_RECOVERY);

        if (attackerHitHealthRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, victim.getPoint(PointsEnum.HEALTH)) * (attackerHitHealthRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.HEALTH, amount);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.HEALTH_BIG);
                this.attacker.debugChat(`[HEALTH_HIT_RECOVERY] You received ${amount} of health`);
            }
        }
    }

    protected calculateAndSendManaHitRecovery(damage: number, victim: AttackableMob) {
        const attackerHitManaRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_MANA_RECOVERY);

        if (attackerHitManaRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, victim.getPoint(PointsEnum.MAX_MANA) || victim.getPoint(PointsEnum.HEALTH)) *
                    (attackerHitManaRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.MANA, amount);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);
                this.attacker.debugChat(`[MANA_HIT_RECOVERY] You received ${amount} of mana`);
            }
        }
    }
}
