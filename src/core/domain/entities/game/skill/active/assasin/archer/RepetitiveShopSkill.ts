import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { AssasinSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class RepetitiveShotSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.REPETITIVE_SHOT;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 2500;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.RANGE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.ATTACK, SkillFlagsEnum.USE_ARROW_DAMAGE]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    context.attack +
                    0.2 * context.attack * Math.floor(2 + context.skillLevel * 6) +
                    (0.8 * context.attack + context.dex * 8 * context.attackRating) * context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 15;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 130 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isAssassin() && player.getSkillGroup() === AssasinSubJobEnum.ARCHER;
    }
}
