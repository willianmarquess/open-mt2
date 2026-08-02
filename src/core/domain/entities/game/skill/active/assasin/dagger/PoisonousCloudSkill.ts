import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { AssasinSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';

export class PoisonousCloudSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.POISONOUS_CLOUD;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 800;
    public readonly maxHit: number = 0;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.ATTACK_POISON,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(context.casterLevel * 2 + (context.attack + context.str * 3 + context.dex * 18) * context.skillLevel),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.STATUS,
            effect: SkillStatusEffectEnum.POISON,
            calculateDuration: (context: SkillCalcContext): number => 5 + 25 * context.skillLevel,
            calculateChance: (context: SkillCalcContext): number => 60 * context.skillLevel,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.5;
    }

    calculateCooldown(): number {
        return 25;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 130 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isAssassin() && player.getSkillGroup() === AssasinSubJobEnum.DAGGER;
    }
}
