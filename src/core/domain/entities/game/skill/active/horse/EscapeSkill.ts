import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import Player from '../../../player/Player';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../Skill';

export class EscapeSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.HORSE_ESCAPE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 55;
    public readonly splashRange: number = 250;
    public readonly range: number = 400;
    public readonly maxHit: number = 12;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.SELFONLY,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.CRUSH,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(2 * (200 + 1.5 * context.casterLevel) + 3 * 200 * context.skillLevel),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 20;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 60 + 160 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isPlayer() && player.isHorseRiding();
    }

    canBeUsedByHorse(): boolean {
        return true;
    }
}
