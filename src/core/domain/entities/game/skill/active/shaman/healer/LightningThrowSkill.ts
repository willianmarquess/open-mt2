import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { ShamanSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import Player from '../../../../player/Player';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';

export class LightningThrowSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.LIGHTNING_THROW;
    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 1800;
    public readonly maxHit: number = 5;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.ATTACK, SkillFlagsEnum.SPLASH]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    60 +
                    4 * context.casterLevel +
                    (7 * context.int +
                        8 * context.magicWeaponAttack +
                        MathUtil.getRandomInt(context.int * 5, context.int * 15)) *
                        context.attackRating *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.6;
    }

    calculateCooldown(): number {
        return 7;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 30 + 150 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isShaman() && player.getSkillGroup() === ShamanSubJobEnum.HEALER;
    }
}
