import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SuraSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class EnchantedBladeSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.ENCHANTED_BLADE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 0;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.NORMAL;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.SELFONLY, SkillFlagsEnum.TOGGLE]);
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.GWIGUM]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.ATTACK_GRADE,
            calculateAmount: (context: SkillCalcContext): number =>
                (3 * context.int + 2 * context.casterLevel) * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 50 + 100 * context.skillLevel,
        },
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HIT_HEALTH_RECOVERY,
            calculateAmount: (context: SkillCalcContext): number => 10 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 50 + 80 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 0;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 20 + 240 * context.skillLevel;
    }

    calculateDurationManaCost(context: SkillCalcContext): number {
        return 2 + 23 * context.skillLevel;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.SWORD;
    }
}
