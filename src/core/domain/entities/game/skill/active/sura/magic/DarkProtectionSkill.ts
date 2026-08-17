import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SuraSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class DarkProtectionSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.DARK_PROTECTION;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 0;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.SELFONLY, SkillFlagsEnum.TOGGLE]);
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.MANASHIELD]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.DEF_GRADE_BONUS,
            calculateAmount: (context: SkillCalcContext): number => (0.5 * context.int + 15) * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 60 + 120 * context.skillLevel,
        },
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.MANASHIELD,
            calculateAmount: (context: SkillCalcContext): number => 100 - context.int * 0.84 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 60 + 120 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.8;
    }

    calculateCooldown(): number {
        return 0;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 20 + 30 * context.skillLevel;
    }

    calculateDurationManaCost(context: SkillCalcContext): number {
        return 5 + 10 * context.skillLevel;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.MAGIC;
    }
}
