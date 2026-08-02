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

export class LightningClawSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.LIGHTNING_CLAW;
    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 2500;
    public readonly maxHit: number = 7;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MAGIC;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.ATTACK]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    50 +
                    5 * context.casterLevel +
                    (6 * context.int + 6 * context.magicWeaponAttack + MathUtil.getRandomInt(1, 800)) *
                        context.attackRating *
                        context.skillLevel
                ) *
                (1 - context.chain * 0.13),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.8;
    }

    calculateCooldown(): number {
        return 10;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 180 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isShaman() && player.getSkillGroup() === ShamanSubJobEnum.HEALER;
    }
}
