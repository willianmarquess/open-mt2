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

export class FireArrowSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.FIRE_ARROW;

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
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(1.5 * context.attack + (2.6 * context.attack + MathUtil.getRandomInt(100, 300)) * context.skillLevel),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.6;
    }

    calculateCooldown(): number {
        return 25;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 50 + 130 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isAssassin() && player.getSkillGroup() === AssasinSubJobEnum.ARCHER;
    }
}
