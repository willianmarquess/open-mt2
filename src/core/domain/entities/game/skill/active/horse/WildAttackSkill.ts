import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import Player from '../../../player/Player';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../Skill';

export class WildAttackSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.HORSE_WILDATTACK;

    public readonly type: SkillTypeEnum = SkillTypeEnum.HORSE;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 50;
    public readonly splashRange: number = 0;
    public readonly range: number = 300;
    public readonly maxHit: number = 10;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.CRUSH,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set();
    public readonly applies: Set<SkillApplies> = new Set([
        {
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(context.attack + 2 * context.attack * context.skillLevel),
            calculateDuration: (): number => 0,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(context: SkillCalcContext): number {
        return 5 - 4 * context.skillLevel;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 60 + 80 * context.skillLevel;
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
