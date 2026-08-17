import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class StrongBodySkill extends ActiveSkill {
    public readonly id: number = SkillEnum.STRONG_BODY;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 0;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.NORMAL;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.SELFONLY, SkillFlagsEnum.TOGGLE]);
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.STRONG_BODY]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.DEF_GRADE_BONUS,
            calculateAmount: (context: SkillCalcContext): number =>
                (200 + context.str * 0.2 + context.con * 0.5) * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 60 + 90 * context.skillLevel,
        },
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.MOVE_SPEED,
            calculateAmount: (context: SkillCalcContext): number => -(1 + 9 * context.skillLevel),
            calculateDuration: (context: SkillCalcContext): number => 60 + 90 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 0;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 80 + 220 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isWarrior() && player.getSkillGroup() === WarriorSubJobEnum.MENTAL;
    }
}
