import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Monster from '../../entities/game/mob/Monster';
import Player from '../../entities/game/player/Player';
import MathUtil from '../../util/MathUtil';
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
import BattlePlayerService from './BattlePlayerService';

const weaponResistanceMapper = {
    [ItemWeaponSubTypeEnum.WEAPON_BELL]: MobResistEnum.BELL,
    [ItemWeaponSubTypeEnum.WEAPON_DAGGER]: MobResistEnum.DAGGER,
    [ItemWeaponSubTypeEnum.WEAPON_FAN]: MobResistEnum.FAN,
    [ItemWeaponSubTypeEnum.WEAPON_SWORD]: MobResistEnum.SWORD,
    [ItemWeaponSubTypeEnum.WEAPON_TWO_HANDED]: MobResistEnum.TWOHAND,
    [ItemWeaponSubTypeEnum.WEAPON_BOW]: MobResistEnum.BOW,
};

export default class BattlePlayerAgainstMobService extends BattlePlayerService<Monster> {
    private readonly logger: Logger;

    constructor(logger: Logger, attacker: Player, victim: Monster) {
        super(attacker, victim);
        this.logger = logger;
    }

    private calculateWeaponDamageResistance(damage: number): number {
        const attackerWeapon = this.attacker.getWeapon();
        if (!attackerWeapon) return damage;

        const resistanceType = weaponResistanceMapper[attackerWeapon.getSubType()];
        if (resistanceType >= 0) {
            return this.applyResistance(damage, this.victim.getResist(resistanceType));
        }

        return Math.round(damage);
    }

    private applyDamage(damage: number, damageType: DamageTypeEnum) {
        //TODO: manage entity battle state
        //TODO verify block attack
        //TODO verify dodge attack
        const damageFlags = new BitFlag();

        if (damageType === DamageTypeEnum.POISON) {
            damageFlags.set(DamageFlagEnum.POISON);
            damage -= damage * (this.victim.getResist(MobResistEnum.POISON) / 100);
        } else {
            damageFlags.set(DamageFlagEnum.NORMAL);

            damage = this.calculateCriticalDamage(damage, damageFlags);
            damage = this.calculatePenetrateDamage(damage, damageFlags);
            this.calculateAndSendHealthSteal(damage);
            this.calculateAndSendManaSteal(damage);
            this.calculateAndSendGoldSteal();
            this.calculateAndSendHealthHitRecovery(damage);
            this.calculateAndSendManaHitRecovery(damage);

            damage = this.calculateWeaponDamageResistance(damage);
            if (this.victim.isStoneSkinner()) {
                //TODO: calculate stoneskin chance, this is not 100%
                damage /= 2;
            }
        }

        damage = damage > 0 ? Math.round(damage) : MathUtil.getRandomInt(1, 5);

        this.attacker.chat({
            message: `your damage is: ${damage}`,
            messageType: ChatMessageTypeEnum.NORMAL,
        });

        this.attacker.sendDamageCaused({
            virtualId: this.victim.getVirtualId(),
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        this.victim.takeDamage(this.attacker, damage);
    }

    execute(attackType: AttackTypeEnum) {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                //we need to verify the battle type before to do this
                this.meleeAttack();
                break;

            default:
                this.logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    private calculateAndSendGoldSteal() {
        const attackerStealGoldChance = this.attacker.getPoint(PointsEnum.STEAL_GOLD);

        if (MathUtil.getRandomInt(1, 100) <= attackerStealGoldChance) {
            //TODO: add gold bonus do multiply this
            const amount = MathUtil.getRandomInt(1, this.victim.getPoint(PointsEnum.LEVEL) * 50);
            this.attacker.addPoint(PointsEnum.GOLD, amount);
            this.attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][GOLD_STEAL] You received ${amount} of gold`,
            });
        }
    }

    private meleeAttack() {
        const MAX_DISTANCE = 500;
        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            this.victim.getPositionX(),
            this.victim.getPositionY(),
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

        const attackRating = this.calcAttackRating();

        //calculate attack for polymorph character

        const basePlayerAttack = this.attacker.getAttack();

        const attack = Math.floor(basePlayerAttack * attackRating);

        this.applyAttackEffect();

        const defense = this.victim.getDefense();
        let damage = Math.max(0, attack - defense);
        damage += this.calculateBonusRaceDamage();

        this.applyDamage(damage, DamageTypeEnum.NORMAL);
    }

    private calculateBonusRaceDamage() {
        let damage = 0;

        switch (true) {
            case this.victim.isRaceByFlag(MobRaceFlagEnum.ANIMAL):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_ANIMAL) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.DEVIL):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_DEVIL) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.DESERT):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_DESERT) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.INSECT):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_INSECT) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.FIRE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_FIRE) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.ICE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_ICE) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.MILGYO):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_MILGYO) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.HUMAN):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_HUMAN) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.TREE):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_TREE) / 100);
                break;
            case this.victim.isRaceByFlag(MobRaceFlagEnum.UNDEAD):
                damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_UNDEAD) / 100);
                break;
        }

        damage += damage * (this.attacker.getPoint(PointsEnum.ATTBONUS_MONSTER) / 100);

        return damage;
    }

    applyFire() {
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.FIRE)) return;

        this.victim.setAffectFlag(AffectBitsTypeEnum.FIRE);
        this.victim.sendUpdateEvent();

        this.victim.addEventTimer({
            id: 'FIRE_AFFECT',
            eventFunction: () => {
                const damage = this.victim.getPoint(PointsEnum.MAX_HEALTH) * 0.05;
                this.applyDamage(damage, DamageTypeEnum.FIRE);
            },
            options: {
                interval: 1_000,
                duration: 10_000,
            },
            onEndEventFunction: () => {
                this.victim.removeAffectFlag(AffectBitsTypeEnum.FIRE);
                this.victim.sendUpdateEvent();
            },
        });
    }

    applyPoison() {
        if (this.victim.isImmuneByFlag(MobImmuneFlagEnum.POISON)) return;
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        this.victim.setAffectFlag(AffectBitsTypeEnum.POISON);
        this.victim.sendUpdateEvent();

        this.victim.addEventTimer({
            id: 'POISON_AFFECT',
            eventFunction: () => {
                const damage = this.victim.getPoint(PointsEnum.MAX_HEALTH) * 0.03;
                this.applyDamage(damage, DamageTypeEnum.POISON);
            },
            options: {
                interval: 1_000,
                duration: 20_000,
            },
            onEndEventFunction: () => {
                this.victim.removeAffectFlag(AffectBitsTypeEnum.POISON);
                this.victim.sendUpdateEvent();
            },
        });
    }

    applyStun() {
        //TODO: reset position
        if (this.victim.isImmuneByFlag(MobImmuneFlagEnum.STUN)) return;
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        this.victim.setAffectFlag(AffectBitsTypeEnum.STUN);
        this.victim.sendUpdateEvent();

        this.victim.addEventTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                this.victim.removeAffectFlag(AffectBitsTypeEnum.STUN);
                this.victim.sendUpdateEvent();
            },
            options: {
                interval: 5_000,
                duration: 5_000,
                repeatCount: 1,
            },
        });
    }

    applySlow() {
        if (this.victim.isImmuneByFlag(MobImmuneFlagEnum.SLOW)) return;
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        this.victim.addPoint(PointsEnum.MOVE_SPEED, -SLOW_VALUE);

        this.victim.setAffectFlag(AffectBitsTypeEnum.SLOW);
        this.victim.sendUpdateEvent();

        this.victim.addEventTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                this.victim.addPoint(PointsEnum.MOVE_SPEED, SLOW_VALUE);
                this.victim.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                this.victim.sendUpdateEvent();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }
}
