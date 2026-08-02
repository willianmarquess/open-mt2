import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SuraSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class FingerStrikeSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.FINGER_STRIKE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 0;
    public readonly maxHit: number = 4;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.PENETRATE,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    context.attack +
                    2 * context.casterLevel +
                    context.int * 2 +
                    (2 * context.attack + context.str * 4 + context.int * 14) * context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.SPECIAL,
            calculateAmount: (context: SkillCalcContext): number => 1 + context.skillLevel * 9,
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 10;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 30 + 140 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.SWORD;
    }
}
