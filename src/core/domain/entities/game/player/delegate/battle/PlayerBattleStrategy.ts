import { PointsEnum } from '@/core/enum/PointsEnum';
import Character from '../../../Character';
import Player from '../../Player';
import MathUtil from '@/core/domain/util/MathUtil';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

export default abstract class PlayerBattleStrategy<Victim extends Character = Character> {
    protected readonly attacker: Player;

    constructor(attacker: Player) {
        this.attacker = attacker;
    }

    abstract execute(attackType: AttackTypeEnum, victim: Victim): void;
    protected abstract applyPoison(victim: Victim): void;
    protected abstract applyStun(victim: Victim): void;
    protected abstract applySlow(victim: Victim): void;

    protected applyResistance(damage: number, resistance: number): number {
        return damage - damage * (resistance / 100);
    }

    protected calcAttackRating(victim: Victim) {
        const attackerRating = this.attacker.getAttackRating();
        const victimRating = victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }

    protected applyAttackEffect(victim: Victim) {
        const poisonChance = this.attacker.getPoint(PointsEnum.POISON_CHANCE);
        const canApplyPoison = poisonChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            this.applyPoison(victim);
        }

        const stunChance = this.attacker.getPoint(PointsEnum.STUN_CHANCE);
        const canApplyStun = stunChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            this.applyStun(victim);
        }

        const slowChance = this.attacker.getPoint(PointsEnum.SLOW_CHANCE);
        const canApplySlow = slowChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            this.applySlow(victim);
        }

        //TODO: add fire affect
        // const canApplyFire = slowChance > 0 && !victim.isAffectByFlag(AffectBitsTypeEnum.FIRE);

        // if (canApplyFire && MathUtil.getRandomInt(1, 100) <= 1) {
        //     this.applyFire();
        // }
    }
}
