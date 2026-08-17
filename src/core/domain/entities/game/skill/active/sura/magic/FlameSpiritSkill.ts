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

export class FlameSpiritSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.FLAME_SPIRIT;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 800;
    public readonly maxHit: number = 1;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.SELFONLY,
        SkillFlagsEnum.COMPUTE_MAGIC_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.TOGGLE,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.FLAME_SPIRIT]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    30 +
                    2 * context.casterLevel +
                    2 * context.int +
                    (7 * context.int + 6 * context.magicWeaponAttack + MathUtil.getRandomInt(200, 500)) *
                        context.attackRating *
                        context.skillLevel
                ),
            calculateDuration: (context: SkillCalcContext): number => 40 + 30 * context.skillLevel,
        },
    ]);

    isPeriodicAreaSkill(): boolean {
        return true;
    }

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 0;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 20 + 30 * context.skillLevel;
    }

    calculateDurationManaCost(context: SkillCalcContext): number {
        return 5 + 40 * context.skillLevel;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.MAGIC;
    }
}
