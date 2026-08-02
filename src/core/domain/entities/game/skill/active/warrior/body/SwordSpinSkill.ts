import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class SwordSpinSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.SWORD_SPIN;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 0;
    public readonly maxHit: number = 12;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([SkillFlagsEnum.ATTACK, SkillFlagsEnum.USE_MELEE_DAMAGE]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateDuration: (): number => 0,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    3 * context.attack +
                    (0.8 * context.attack + context.str * 5 + context.dex * 3 + context.con) * context.skillLevel
                ),
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 12;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 50 + 130 * context.skillLevel;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isWarrior() && player.getSkillGroup() === WarriorSubJobEnum.BODY;
    }
}
