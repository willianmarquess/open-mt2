import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import Player from '../../../player/Player';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../Skill';

export class ChargeSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.HORSE_CHARGE;

    public readonly type: SkillTypeEnum = SkillTypeEnum.HORSE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 52;
    public readonly splashRange: number = 100;
    public readonly range: number = 400;
    public readonly maxHit: number = 6;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.CRUSH_LONG,
        SkillFlagsEnum.SPLASH,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(2.4 * (200 + 1.5 * context.casterLevel) + 3 * 200 * context.skillLevel),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 15;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 60 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isPlayer();
    }

    canBeUsedByHorse(): boolean {
        return true;
    }
}
