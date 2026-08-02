import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SuraSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class ShockwaveSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.SHOCKWAVE;
    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 400;
    public readonly range: number = 1200;
    public readonly maxHit: number = 9;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.COMPUTE_MAGIC_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.ATTACK_SLOW,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    40 +
                    2 * context.casterLevel +
                    2 * context.int +
                    (2 * context.con +
                        2 * context.dex +
                        13 * context.int +
                        6 * context.magicWeaponAttack +
                        MathUtil.getRandomInt(180, 200)) *
                        context.attackRating *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.STATUS,
            effect: SkillStatusEffectEnum.SLOW,
            calculateChance: (context: SkillCalcContext): number => 333 + 300 * context.skillLevel,
            calculateDuration: (context: SkillCalcContext): number => 10 + 10 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.8;
    }

    calculateCooldown(): number {
        return 12;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isSura() && player.getSkillGroup() === SuraSubJobEnum.MAGIC;
    }
}
