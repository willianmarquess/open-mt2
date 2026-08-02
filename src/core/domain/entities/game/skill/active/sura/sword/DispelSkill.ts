import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SuraSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class DispelSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.DISPEL;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 1800;
    public readonly maxHit: number = 5;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.NORMAL;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.COMPUTE_MAGIC_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.REMOVE_GOOD_AFFECT,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    40 +
                    5 * context.casterLevel +
                    2 * context.int +
                    (10 * context.int + 7 * context.magicWeaponAttack + MathUtil.getRandomInt(50, 100)) *
                        context.attackRating *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.SPECIAL,
            calculateChance: (context: SkillCalcContext): number => 10 + 40 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 7 + 23 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.6;
    }

    calculateCooldown(): number {
        return 12;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 30 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.SWORD;
    }
}
