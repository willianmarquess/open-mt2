import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Player from '../../entities/game/player/Player';
import BattleService from './BattleService';
import { Mob } from '../../entities/game/mob/Mob';
import Logger from '@/core/infra/logger/Logger';
import Monster from '../../entities/game/mob/Monster';
import BitFlag from '@/core/util/BitFlag';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';
import MathUtil from '../../util/MathUtil';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { MobEnchantEnum } from '@/core/enum/MobEnchantEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';

export default class BattleMobAgainstPlayerService extends BattleService<Mob, Player> {
    private readonly logger: Logger;

    constructor(logger: Logger, attacker: Monster, victim: Player) {
        super(attacker, victim);
        this.logger = logger;
    }

    execute(attackType: AttackTypeEnum): void {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                switch (this.attacker.getBattleType()) {
                    case BattleTypeEnum.MELEE:
                    case BattleTypeEnum.POWER:
                    case BattleTypeEnum.TANKER:
                    case BattleTypeEnum.SUPER_POWER:
                    case BattleTypeEnum.SUPER_TANKER:
                        this.meleeAttack();
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

    private meleeAttack() {
        const MAX_DISTANCE = this.attacker.getAttackRange() * 1.15; //TODO: validate this value
        const distance = MathUtil.calcDistance(
            this.attacker.getPositionX(),
            this.attacker.getPositionY(),
            this.victim.getPositionX(),
            this.victim.getPositionY(),
        );

        if (distance > MAX_DISTANCE) {
            this.logger.info(`[MonsterBattle] Very far from the victim.`);
            return;
        }

        const attackRating = this.calcAttackRating();
        const baseMonsterAttack = this.attacker.getAttack();
        const attack = Math.floor(baseMonsterAttack * attackRating);

        this.applyAttackEffect();

        const defense = this.victim.getDefense();
        const damage = Math.max(0, attack - defense);

        this.applyDamage(damage, DamageTypeEnum.NORMAL);
    }

    private applyDamage(damage: number, damageType: DamageTypeEnum) {
        //TODO verify block attack
        //TODO verify dodge attack

        const damageFlags = new BitFlag();

        if (damageType === DamageTypeEnum.POISON) {
            damageFlags.set(DamageFlagEnum.POISON);
            damage -= damage * (this.victim.getPoint(PointsEnum.POISON_REDUCE) / 100);
        } else {
            damageFlags.set(DamageFlagEnum.NORMAL);

            damage = this.calculateCriticalDamage(damage, damageFlags);
            damage = this.calculatePenetrateDamage(damage, damageFlags);
            damage = this.calculateDeathBlow(damage);
        }

        damage = damage > 0 ? Math.round(damage) : MathUtil.getRandomInt(1, 5);

        this.victim.chat({
            message: `received damage: ${damage}`,
            messageType: ChatMessageTypeEnum.INFO,
        });

        this.victim.sendDamageReceived({
            damage,
            damageFlags: damageFlags.getFlag(),
        });

        this.victim.takeDamage(this.attacker, damage);
    }

    private calculateDeathBlow(damage: number) {
        if (this.attacker.isDeathBlower()) {
            if (MathUtil.getRandomInt(1, 100) <= this.attacker.getDeathBlowChance()) {
                damage *= 4;
                this.victim.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[DEATH_BLOW] you received ${Math.round(damage / 5)} extra damage as deathblow`,
                });
            }
        }

        return Math.round(damage);
    }

    private calculateCriticalDamage(damage: number, damageFlags: BitFlag): number {
        const criticalChance = this.attacker.getEnchant(MobEnchantEnum.CRITICAL);
        if (MathUtil.getRandomInt(1, 100) <= criticalChance) {
            damage *= 2;
            damageFlags.set(DamageFlagEnum.CRITICAL);
            this.victim.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[CRIT_DAMAGE] you received ${Math.round(damage / 2)} extra damage as critical`,
            });
        }

        return Math.round(damage);
    }

    private calculatePenetrateDamage(damage: number, damageFlags: BitFlag): number {
        const penetrateChance = this.attacker.getEnchant(MobEnchantEnum.PENETRATE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += this.victim.getDefense();
            damageFlags.set(DamageFlagEnum.PENETRATE);
            this.victim.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[PENETRATE_DAMAGE] you received ${this.victim.getDefense()} extra damage as penetrate`,
            });
        }
        return Math.round(damage);
    }

    protected applyAttackEffect() {
        const poisonChance = this.attacker.getEnchant(MobEnchantEnum.POISON);
        const canApplyPoison = poisonChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            this.applyPoison();
        }

        const stunChance = this.attacker.getEnchant(MobEnchantEnum.STUN);
        const canApplyStun = stunChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            this.applyStun();
        }

        const slowChance = this.attacker.getEnchant(MobEnchantEnum.SLOW);
        const canApplySlow = slowChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            this.applySlow();
        }

        //TODO: CURSE effect ??? i believe this effect is not used
    }

    applyPoison(): void {
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;

        this.victim.setAffectFlag(AffectBitsTypeEnum.POISON);
        this.victim.updateView();

        this.victim.getEventTimerManager().addTimer({
            id: 'POISON_AFFECT',
            eventFunction: () => {
                const damage = this.victim.getPoint(PointsEnum.MAX_HEALTH) * 0.03;
                this.applyDamage(damage, DamageTypeEnum.POISON);
            },
            options: {
                interval: 1_000,
                duration: 5_000,
            },
            onEndEventFunction: () => {
                this.victim.removeAffectFlag(AffectBitsTypeEnum.POISON);
                this.victim.updateView();
            },
        });
    }

    applyStun() {
        //TODO: use antistun to calculate this chance to apply or not
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;

        this.victim.setAffectFlag(AffectBitsTypeEnum.STUN);
        this.victim.updateView();

        this.victim.getEventTimerManager().addTimer({
            id: 'STUN_AFFECT',
            eventFunction: () => {
                this.victim.removeAffectFlag(AffectBitsTypeEnum.STUN);
                this.victim.updateView();
            },
            options: {
                interval: 2_000,
                duration: 2_000,
                repeatCount: 1,
            },
        });
    }

    applySlow() {
        //TODO: use antislow to calculate this chance to apply or not
        if (this.victim.isAffectByFlag(AffectBitsTypeEnum.SLOW)) return;
        const SLOW_VALUE = 30;
        this.victim.setMovementSpeed(this.victim.getMovementSpeed() - SLOW_VALUE);

        this.victim.setAffectFlag(AffectBitsTypeEnum.SLOW);
        this.victim.updateView();

        this.victim.getEventTimerManager().addTimer({
            id: 'SLOW_AFFECT',
            eventFunction: () => {
                this.victim.setMovementSpeed(this.victim.getMovementSpeed() + SLOW_VALUE);
                this.victim.removeAffectFlag(AffectBitsTypeEnum.SLOW);
                this.victim.updateView();
            },
            options: {
                interval: 10_000,
                duration: 10_000,
                repeatCount: 1,
            },
        });
    }
}
