import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';

export class StumpSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.STUMP;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 400;
    public readonly range: number = 0;
    public readonly maxHit: number = 10;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.SELFONLY,
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
                    2 * context.attack +
                    (2 * context.attack + 2 * context.dex + 2 * context.con + context.str * 4) * context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            kind: SkillApplyKindEnum.STATUS,
            effect: SkillStatusEffectEnum.STUN,
            calculateChance: (context: SkillCalcContext): number => 100 + (context.skillLevel * 1000) / 6,
            calculateDuration: (): number => 2,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 25;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 50 + 140 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isWarrior() && player.getSkillGroup() === WarriorSubJobEnum.MENTAL;
    }
}
