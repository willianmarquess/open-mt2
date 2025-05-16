import { PointsEnum } from '@/core/enum/PointsEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import BitFlag from '@/core/util/BitFlag';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { MobEnchantEnum } from '@/core/enum/MobEnchantEnum';
import Player from '../../../player/Player';
import { Mob } from '../../Mob';

export default class MobBattle {
    private readonly logger: Logger;
    private readonly attacker: Mob;

    constructor(attacker: Mob, logger: Logger) {
        this.attacker = attacker;
        this.logger = logger;
    }

    execute(attackType: AttackTypeEnum, victim: Player): void {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                switch (this.attacker.getBattleType()) {
                    case BattleTypeEnum.MELEE:
                    case BattleTypeEnum.POWER:
                    case BattleTypeEnum.TANKER:
                    case BattleTypeEnum.SUPER_POWER:
                    case BattleTypeEnum.SUPER_TANKER:
                        this.meleeAttack(victim);
                        break;

                    case BattleTypeEnum.RANGE:
                        //TODO
                        break;

                    case BattleTypeEnum.MAGIC:
                        //TODO
                        break;
                }
                break;

            default:
                this.logger.info(`[MonsterBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    private meleeAttack(victim: Player) {
        const MAX_DISTANCE = this.attacker.getAttackRange() * 1.15; //TODO: validate this value
        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );

        if (distance > MAX_DISTANCE) {
            this.logger.info(`[MonsterBattle] Very far from the victim.`);
            return;
        }

        const attackRating = this.calcAttackRating(victim);
        const baseMonsterAttack = this.attacker.getAttack();
        const attack = Math.floor(baseMonsterAttack * attackRating);

        this.applyAttackEffect(victim);

        const defense = victim.getDefense();
        const damage = Math.max(0, attack - defense);

        this.applyDamage(damage, DamageTypeEnum.NORMAL, victim);
    }

    private applyDamage(damage: number, damageType: DamageTypeEnum, victim: Player) {
        //TODO verify block attack
        //TODO verify dodge attack

        const damageFlags = new BitFlag();

        if (damageType === DamageTypeEnum.POISON) {
            damageFlags.set(DamageFlagEnum.POISON);
            damage -= damage * (victim.getPoint(PointsEnum.POISON_REDUCE) / 100);
        } else {
            damageFlags.set(DamageFlagEnum.NORMAL);

            damage = this.calculateCriticalDamage(damage, damageFlags, victim);
            damage = this.calculatePenetrateDamage(damage, damageFlags, victim);
            damage = this.calculateDeathBlow(damage, victim);
        }

        damage = damage > 0 ? Math.round(damage) : MathUtil.getRandomInt(1, 5);

        victim.chat({
            message: `[SYSTEM] Damage received: ${damage}`,
            messageType: ChatMessageTypeEnum.INFO,
        });

        victim.sendDamageReceived({
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        victim.takeDamage(this.attacker, damage);
    }

    private calculateDeathBlow(damage: number, victim: Player) {
        if (this.attacker.isDeathBlower()) {
            if (MathUtil.getRandomInt(1, 100) <= this.attacker.getDeathBlowChance()) {
                damage *= 4;
                victim.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][DEATH_BLOW] You received ${Math.round(damage / 5)} extra damage as deathblow`,
                });
            }
        }

        return Math.round(damage);
    }

    private calculateCriticalDamage(damage: number, damageFlags: BitFlag, victim: Player): number {
        const criticalChance = this.attacker.getEnchant(MobEnchantEnum.CRITICAL);
        if (MathUtil.getRandomInt(1, 100) <= criticalChance) {
            damage *= 2;
            damageFlags.set(DamageFlagEnum.CRITICAL);
            victim.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][CRIT_DAMAGE] You received ${Math.round(damage / 2)} extra damage as critical`,
            });
        }

        return Math.round(damage);
    }

    private calculatePenetrateDamage(damage: number, damageFlags: BitFlag, victim: Player): number {
        const penetrateChance = this.attacker.getEnchant(MobEnchantEnum.PENETRATE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += victim.getDefense(); //TODO: is this a bug or feature?
            damageFlags.set(DamageFlagEnum.PENETRATE);
            victim.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][PENETRATE_DAMAGE] You received ${victim.getDefense()} extra damage as penetrate`,
            });
        }
        return Math.round(damage);
    }

    private applyAttackEffect(victim: Player) {
        const poisonChance = this.attacker.getEnchant(MobEnchantEnum.POISON);
        const canApplyPoison = poisonChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            this.applyPoison(victim);
        }

        const stunChance = this.attacker.getEnchant(MobEnchantEnum.STUN);
        const canApplyStun = stunChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            this.applyStun(victim);
        }

        const slowChance = this.attacker.getEnchant(MobEnchantEnum.SLOW);
        const canApplySlow = slowChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            this.applySlow(victim);
        }

        //TODO: CURSE effect ??? i believe this effect is not used, but we can create
    }

    private applyPoison(victim: Player): void {
        if (victim.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.POISON);
        victim.updateView();

        victim.addEventTimer({
            id: 'POISON_AFFECT',
            eventFunction: () => {
                const damage = victim.getPoint(PointsEnum.MAX_HEALTH) * 0.03;
                this.applyDamage(damage, DamageTypeEnum.POISON, victim);
            },
            options: {
                interval: 1_000,
                duration: 5_000,
            },
            onEndEventFunction: () => {
                victim.removeAffectFlag(AffectBitsTypeEnum.POISON);
                victim.updateView();
            },
        });
    }

    private applyStun(victim: Player) {
        //TODO: use antistun to calculate this chance to apply or not
        //TODO: reset player future position
        if (victim.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        victim.setAffectFlag(AffectBitsTypeEnum.STUN);
        victim.updateView();

        victim.addEventTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                victim.removeAffectFlag(AffectBitsTypeEnum.STUN);
                victim.updateView();
            },
            options: {
                interval: 2_000,
                duration: 2_000,
                repeatCount: 1,
            },
        });
    }

    private applySlow(victim: Player) {
        //TODO: use antislow to calculate this chance to apply or not
        if (victim.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        victim.addPoint(PointsEnum.MOVE_SPEED, -SLOW_VALUE);

        victim.setAffectFlag(AffectBitsTypeEnum.SLOW);
        victim.updateView();

        victim.addEventTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                victim.addPoint(PointsEnum.MOVE_SPEED, SLOW_VALUE);
                victim.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                victim.updateView();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }

    private applyResistance(damage: number, resistance: number): number {
        return damage - damage * (resistance / 100);
    }

    private calcAttackRating(victim: Player) {
        const attackerRating = this.attacker.getAttackRating();
        const victimRating = victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }
}
