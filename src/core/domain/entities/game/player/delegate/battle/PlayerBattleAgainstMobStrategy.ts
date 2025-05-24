import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
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
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { MobRaceFlagEnum } from '@/core/enum/MobRaceFlagEnum';
import Monster from '../../../mob/Monster';
import Player from '../../Player';
import MathUtil from '@/core/domain/util/MathUtil';
import { FlyEnum } from '@/core/enum/FlyEnum';
import PlayerBattleStrategy from './PlayerBattleStrategy';

const weaponResistanceMapper = {
    [ItemWeaponSubTypeEnum.WEAPON_BELL]: MobResistEnum.BELL,
    [ItemWeaponSubTypeEnum.WEAPON_DAGGER]: MobResistEnum.DAGGER,
    [ItemWeaponSubTypeEnum.WEAPON_FAN]: MobResistEnum.FAN,
    [ItemWeaponSubTypeEnum.WEAPON_SWORD]: MobResistEnum.SWORD,
    [ItemWeaponSubTypeEnum.WEAPON_TWO_HANDED]: MobResistEnum.TWOHAND,
    [ItemWeaponSubTypeEnum.WEAPON_BOW]: MobResistEnum.BOW,
};

const MAX_DISTANCE = 500; //TODO: this should be calculated by player weapon, hackers can use this fixed value to attack with 500 of range for daggers, sword, bell, fan etc

export default class PlayerBattleAgainstMobStrategy extends PlayerBattleStrategy<Monster> {
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        super(player);
        this.logger = logger;
    }

    execute(attackType: AttackTypeEnum, victim: Monster) {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                //we need to verify the battle type before to do this
                this.meleeAttack(victim);
                break;

            default:
                this.logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    private calculateSkillDamage(
        damage: number,
        damageType: DamageTypeEnum,
        damageFlags: BitFlag,
        victim: Monster,
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
        victim: Monster,
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
        victim: Monster,
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

    private applyDamage(damage: number, damageType: DamageTypeEnum, victim: Monster) {
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
                damage = this.calculateSkillDamage(damage, damageType, damageFlags, victim);
                break;
        }

        damage = damage > 0 ? Math.round(damage) : MathUtil.getRandomInt(1, 5);

        this.attacker.chat({
            message: `your damage is: ${damage}`,
            messageType: ChatMessageTypeEnum.INFO,
        });

        this.attacker.sendDamageCaused({
            virtualId: victim.getVirtualId(),
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        victim.takeDamage(this.attacker, damage);
    }

    private meleeAttack(victim: Monster) {
        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );

        if (distance > MAX_DISTANCE) {
            this.logger.info(`[PlayerBattle] Very far from the victim.`);
            return;
        }

        const weapon = this.attacker.getWeapon();

        if (weapon && weapon.getType() === ItemTypeEnum.ITEM_WEAPON) {
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

        const attack = Math.floor(basePlayerAttack * attackRating);

        this.applyAttackEffect(victim);

        const defense = victim.getDefense();
        let damage = Math.max(0, attack - defense);
        damage += this.calculateBonusRaceDamage(victim);

        this.applyDamage(damage, DamageTypeEnum.NORMAL, victim);
    }

    private calculateSkillDamageBonus(damage: number, victim: Monster): number {
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

    private calculateStoneSkinner(damage: number, victim: Monster): number {
        if (victim.isStoneSkinner()) {
            if (victim.getHealthPercentage() < victim.getHpPercentToGetStoneSkin()) {
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][STONE_SKINNER] Your damage was reduced from ${damage} to ${damage / 2}`,
                });
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

    private calculateNormalDamageBonus(damage: number, victim: Monster) {
        const normalHitDamageBonus = this.attacker.getPoint(PointsEnum.NORMAL_HIT_DAMAGE_BONUS);

        if (normalHitDamageBonus > 0) {
            damage *= (100 + normalHitDamageBonus) / 100;
        }

        damage *= (100 - Math.min(99, victim.getPoint(PointsEnum.NORMAL_HIT_DEFEND_BONUS))) / 100; //TODO: this line of code will be used only for PVP, we will reuse this for inheritance later

        return Math.round(damage);
    }

    private calculateAndApplyDrainSp(victim: Monster) {
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

    private calculateWeaponDamageResistance(damage: number, victim: Monster): number {
        const attackerWeapon = this.attacker.getWeapon();
        if (!attackerWeapon) return damage;

        const resistanceType = weaponResistanceMapper[attackerWeapon.getSubType()];
        if (resistanceType >= 0) {
            return this.applyResistance(damage, victim.getResist(resistanceType));
        }

        return Math.round(damage);
    }

    private calculateAndSendGoldSteal(victim: Monster) {
        const attackerStealGoldChance = this.attacker.getPoint(PointsEnum.STEAL_GOLD);

        if (MathUtil.getRandomInt(1, 100) <= attackerStealGoldChance) {
            //TODO: add gold bonus do multiply this
            const amount = MathUtil.getRandomInt(1, victim.getPoint(PointsEnum.LEVEL) * 50);
            this.attacker.addPoint(PointsEnum.GOLD, amount);
            this.attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][GOLD_STEAL] You received ${amount} of gold`,
            });
        }
    }

    private calculateBonusRaceDamage(victim: Monster) {
        let damage = 0;

        switch (true) {
            case victim.isRaceByFlag(MobRaceFlagEnum.ANIMAL):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_ANIMAL) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.DEVIL):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_DEVIL) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.DESERT):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_DESERT) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.INSECT):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_INSECT) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.FIRE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_FIRE) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.ICE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_ICE) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.MILGYO):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_MILGYO) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.HUMAN):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_HUMAN) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.TREE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_TREE) / 100);
                break;
            case victim.isRaceByFlag(MobRaceFlagEnum.UNDEAD):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_UNDEAD) / 100);
                break;
        }

        damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_MONSTER) / 100);

        return damage;
    }

    protected applyFire(victim: Monster) {
        if (victim.isAffectByFlag(AffectBitsTypeEnum.FIRE)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.FIRE);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: 'FIRE_AFFECT',
            eventFunction: () => {
                const damage = victim.getPoint(PointsEnum.MAX_HEALTH) * 0.05;
                this.applyDamage(damage, DamageTypeEnum.FIRE, victim);
            },
            options: {
                interval: 1_000,
                duration: 10_000,
            },
            onEndEventFunction: () => {
                victim.removeAffectFlag(AffectBitsTypeEnum.FIRE);
                victim.sendUpdateEvent();
            },
        });
    }

    protected applyPoison(victim: Monster) {
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.POISON)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.POISON);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: 'POISON_AFFECT',
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

    protected applyStun(victim: Monster) {
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.STUN)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        victim.stun();

        victim.addEventTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                victim.removeStun();
            },
            options: {
                interval: 5_000,
                duration: 5_000,
                repeatCount: 1,
            },
        });
    }

    protected applySlow(victim: Monster) {
        if (victim.isImmuneByFlag(MobImmuneFlagEnum.SLOW)) return;
        if (victim.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        victim.addPoint(PointsEnum.MOVE_SPEED, -SLOW_VALUE);

        victim.setAffectFlag(AffectBitsTypeEnum.SLOW);
        victim.sendUpdateEvent();

        victim.addEventTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                victim.addPoint(PointsEnum.MOVE_SPEED, SLOW_VALUE);
                victim.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                victim.sendUpdateEvent();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }

    protected calculateCriticalDamage(damage: number, damageFlags: BitFlag): number {
        const criticalChance = this.attacker.getPoint(PointsEnum.CRITICAL_CHANCE);
        if (MathUtil.getRandomInt(1, 100) <= criticalChance) {
            damage *= 2;
            damageFlags.set(DamageFlagEnum.CRITICAL);
            this.attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][CRIT_DAMAGE] You deal ${Math.round(damage / 2)} extra damage as critical`,
            });
        }

        return Math.round(damage);
    }

    protected calculatePenetrateDamage(damage: number, damageFlags: BitFlag, victim: Monster): number {
        const penetrateChance = this.attacker.getPoint(PointsEnum.PENETRATE_CHANCE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += victim.getDefense();
            damageFlags.set(DamageFlagEnum.PENETRATE);
            this.attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][PENETRATE_DAMAGE] You deal ${victim.getDefense()} extra damage as penetrate`,
            });
        }
        return Math.round(damage);
    }

    protected calculateAndSendHealthSteal(damage: number, victim: Monster) {
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
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][HEALTH_STEAL] You received ${healthDamage} of health
                    `,
                });
            }
        }
    }

    protected calculateAndSendManaSteal(damage: number, victim: Monster) {
        const attackerStealManaValue = this.attacker.getPoint(PointsEnum.STEAL_MANA);

        if (attackerStealManaValue > 0) {
            const stealManaChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealManaChance) {
                const manaDamage = Math.round(
                    (Math.min(
                        damage,
                        Math.max(0, victim.getPoint(PointsEnum.MAX_MANA) || victim.getPoint(PointsEnum.HEALTH)),
                    ) *
                        attackerStealManaValue) /
                        100,
                );

                victim.takeDamage(this.attacker, manaDamage);

                this.attacker.addPoint(PointsEnum.MANA, manaDamage);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);

                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][MANA_STEAL] You received ${manaDamage} of mana`,
                });
            }
        }
    }

    protected calculateAndSendHealthHitRecovery(damage: number, victim: Monster) {
        const attackerHitHealthRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_HEALTH_RECOVERY);

        if (attackerHitHealthRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, victim.getPoint(PointsEnum.HEALTH)) * (attackerHitHealthRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.HEALTH, amount);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.HEALTH_BIG);
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][HEALTH_HIT_RECOVERY] You received ${amount} of health`,
                });
            }
        }
    }

    protected calculateAndSendManaHitRecovery(damage: number, victim: Monster) {
        const attackerHitManaRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_MANA_RECOVERY);

        if (attackerHitManaRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, victim.getPoint(PointsEnum.MAX_MANA) || victim.getPoint(PointsEnum.HEALTH)) *
                    (attackerHitManaRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.MANA, amount);
                victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][MANA_HIT_RECOVERY] You received ${amount} of mana`,
                });
            }
        }
    }
}
