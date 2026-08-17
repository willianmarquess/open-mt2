import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ShamanSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';

export class SummonLightningSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.SUMMON_LIGHTNING;
    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 400;
    public readonly range: number = 1500;
    public readonly maxHit: number = 15;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.ATTACK_STUN,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    40 +
                    4 * context.casterLevel +
                    (13 * context.int +
                        7 * context.magicWeaponAttack +
                        MathUtil.getRandomInt(context.int * 5, context.int * 16)) *
                        context.attackRating *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.STATUS,
            effect: SkillStatusEffectEnum.STUN,
            calculateChance: (context: SkillCalcContext): number => 50 + (1000 * context.skillLevel) / 6,
            calculateDuration: (): number => 5,
        },
    ]);

    resolvesInstantlyOnCast(): boolean {
        return true;
    }

    calculateSplashAroundDamageAdjust(): number {
        return 0.8;
    }

    calculateCooldown(): number {
        return 15;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 50 + 150 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isShaman() && player.getSkillGroup() === ShamanSubJobEnum.HEALER;
    }
}
