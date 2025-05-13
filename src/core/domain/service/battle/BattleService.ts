import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Character from '../../entities/game/Character';
import { PointsEnum } from '@/core/enum/PointsEnum';
import MathUtil from '../../util/MathUtil';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

export default abstract class BattleService<
    Attacker extends Character = Character,
    Victim extends Character = Character,
> {
    protected readonly attacker: Attacker;
    protected readonly victim: Victim;

    constructor(attacker: Attacker, victim: Victim) {
        this.attacker = attacker;
        this.victim = victim;
    }

    abstract execute(attackType: AttackTypeEnum): void;
    abstract applyPoison(): void;
    abstract applyStun(): void;
    abstract applySlow(): void;

    protected applyResistance(damage: number, resistance: number): number {
        return damage - damage * (resistance / 100);
    }

    protected calcAttackRating() {
        const attackerRating = this.attacker.getAttackRating();
        const victimRating = this.victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }

    protected applyAttackEffect() {
        const poisonChance = this.attacker.getPoint(PointsEnum.POISON_CHANCE);
        const canApplyPoison = poisonChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.POISON);

        if (canApplyPoison && MathUtil.getRandomInt(1, 100) <= poisonChance) {
            this.applyPoison();
        }

        const stunChance = this.attacker.getPoint(PointsEnum.STUN_CHANCE);
        const canApplyStun = stunChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.STUN);

        if (canApplyStun && MathUtil.getRandomInt(1, 100) <= stunChance) {
            this.applyStun();
        }

        const slowChance = this.attacker.getPoint(PointsEnum.SLOW_CHANCE);
        const canApplySlow = slowChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.SLOW);

        if (canApplySlow && MathUtil.getRandomInt(1, 100) <= slowChance) {
            this.applySlow();
        }

        //TODO: add fire affect
        // const canApplyFire = slowChance > 0 && !this.victim.isAffectByFlag(AffectBitsTypeEnum.FIRE);

        // if (canApplyFire && MathUtil.getRandomInt(1, 100) <= 1) {
        //     this.applyFire();
        // }
    }
}
