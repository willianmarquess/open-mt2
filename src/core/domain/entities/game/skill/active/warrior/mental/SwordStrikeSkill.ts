import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class SwordStrikeSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.SWORD_STRIKE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 1200;
    public readonly maxHit: number = 10;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.CRUSH,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    2 * context.attack +
                    (context.attack + context.dex * 3 + context.str * 5 + context.con) * context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 0.5;
    }

    calculateCooldown(): number {
        return 20;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 40 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isWarrior() && player.getSkillGroup() === WarriorSubJobEnum.MENTAL;
    }
}
