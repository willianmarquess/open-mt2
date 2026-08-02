import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { AssasinSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';

export class PoisonArrowSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.POISON_ARROW;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 300;
    public readonly range: number = 2500;
    public readonly maxHit: number = 12;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.RANGE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.USE_ARROW_DAMAGE,
        SkillFlagsEnum.CRUSH,
        SkillFlagsEnum.ATTACK_POISON,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    context.attack +
                    (1.2 * context.attack + MathUtil.getRandomInt(100, 200) + context.dex * 6 + context.str * 2) *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.STATUS,
            effect: SkillStatusEffectEnum.POISON,
            calculateDuration: (context: SkillCalcContext): number => 15 + 30 * context.skillLevel,
            calculateChance: (context: SkillCalcContext): number => 80 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.5;
    }

    calculateCooldown(): number {
        return 25;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 160 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isAssassin() && player.getSkillGroup() === AssasinSubJobEnum.ARCHER;
    }
}
