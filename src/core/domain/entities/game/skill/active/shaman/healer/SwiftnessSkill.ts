import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ShamanSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';

export class SwiftnessSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.SWIFTNESS;
    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 1000;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.NORMAL;
    public readonly flags: Set<SkillFlagsEnum> = new Set();
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.SWIFTNESS]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.MOVE_SPEED,
            calculateAmount: (context: SkillCalcContext): number => 5 + 35 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 60 + 100 * context.skillLevel,
        },
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.CASTING_SPEED,
            calculateAmount: (context: SkillCalcContext): number => 3 + 33 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 60 + 100 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 10;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 60 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isShaman() && player.getSkillGroup() === ShamanSubJobEnum.HEALER;
    }
}
