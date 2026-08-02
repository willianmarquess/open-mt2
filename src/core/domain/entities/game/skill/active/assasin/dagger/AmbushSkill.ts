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

export class AmbushSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.AMBUSH;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 0;
    public readonly range: number = 0;
    public readonly maxHit: number = 6;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.ATTACK, SkillFlagsEnum.USE_MELEE_DAMAGE]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    context.attack +
                    (1.2 * context.attack + MathUtil.getRandomInt(500, 700) + context.dex * 4 + context.str * 4) *
                        context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.8;
    }

    calculateCooldown(): number {
        return 15;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 160 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isAssassin() && player.getSkillGroup() === AssasinSubJobEnum.DAGGER;
    }
}
