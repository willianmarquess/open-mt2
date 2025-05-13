import Character from '../../entities/game/Character';
import Player from '../../entities/game/player/Player';
import { PointsEnum } from '@/core/enum/PointsEnum';
import MathUtil from '../../util/MathUtil';
import { FlyEnum } from '@/core/enum/FlyEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import BattleService from './BattleService';
import BitFlag from '@/core/util/BitFlag';
import { DamageFlagEnum } from '@/core/enum/DamageFlagEnum';

export default abstract class BattlePlayerService<Victim extends Character = Character> extends BattleService<
    Player,
    Victim
> {
    protected applyResistance(damage: number, resistance: number): number {
        return damage - damage * (resistance / 100);
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

    protected calculatePenetrateDamage(damage: number, damageFlags: BitFlag): number {
        const penetrateChance = this.attacker.getPoint(PointsEnum.PENETRATE_CHANCE);
        if (MathUtil.getRandomInt(1, 100) <= penetrateChance) {
            damage += this.victim.getDefense();
            damageFlags.set(DamageFlagEnum.PENETRATE);
            this.attacker.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM][PENETRATE_DAMAGE] You deal ${this.victim.getDefense()} extra damage as penetrate`,
            });
        }
        return Math.round(damage);
    }

    protected calculateAndSendHealthSteal(damage: number) {
        const attackerStealHealthValue = this.attacker.getPoint(PointsEnum.STEAL_HEALTH);

        if (attackerStealHealthValue > 0) {
            const stealHealthChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealHealthChance) {
                const healthDamage = Math.round(
                    (Math.min(damage, Math.max(0, this.victim.getPoint(PointsEnum.HEALTH))) *
                        attackerStealHealthValue) /
                        100,
                );

                this.victim.takeDamage(this.attacker as unknown as Character, healthDamage);
                this.attacker.addPoint(PointsEnum.HEALTH, healthDamage);

                this.victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.HEALTH_BIG);
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][HEALTH_STEAL] You received ${healthDamage} of health
                    `,
                });
            }
        }
    }

    protected calculateAndSendManaSteal(damage: number) {
        const attackerStealManaValue = this.attacker.getPoint(PointsEnum.STEAL_MANA);

        if (attackerStealManaValue > 0) {
            const stealManaChance = 1;
            if (MathUtil.getRandomInt(1, 10) <= stealManaChance) {
                const manaDamage = Math.round(
                    (Math.min(
                        damage,
                        Math.max(
                            0,
                            this.victim.getPoint(PointsEnum.MAX_MANA) || this.victim.getPoint(PointsEnum.HEALTH),
                        ),
                    ) *
                        attackerStealManaValue) /
                        100,
                );

                this.victim.takeDamage(this.attacker as unknown as Character, manaDamage);

                this.attacker.addPoint(PointsEnum.MANA, manaDamage);
                this.victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);

                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][MANA_STEAL] You received ${manaDamage} of mana`,
                });
            }
        }
    }

    protected calculateAndSendHealthHitRecovery(damage: number) {
        const attackerHitHealthRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_HEALTH_RECOVERY);

        if (attackerHitHealthRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, this.victim.getPoint(PointsEnum.HEALTH)) * (attackerHitHealthRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.HEALTH, amount);
                this.victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.HEALTH_BIG);
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][HEALTH_HIT_RECOVERY] You received ${amount} of health`,
                });
            }
        }
    }

    protected calculateAndSendManaHitRecovery(damage: number) {
        const attackerHitManaRecoveryPercentage = this.attacker.getPoint(PointsEnum.HIT_MANA_RECOVERY);

        if (attackerHitManaRecoveryPercentage > 0) {
            const amount = Math.round(
                Math.min(damage, this.victim.getPoint(PointsEnum.MAX_MANA) || this.victim.getPoint(PointsEnum.HEALTH)) *
                    (attackerHitManaRecoveryPercentage / 100),
            );

            if (amount > 0) {
                this.attacker.addPoint(PointsEnum.MANA, amount);
                this.victim.createFlyEffect(this.attacker.getVirtualId(), FlyEnum.MANA_BIG);
                this.attacker.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: `[SYSTEM][MANA_HIT_RECOVERY] You received ${amount} of mana`,
                });
            }
        }
    }
}
