import { SkillEnum } from '@/core/enum/SkillEnum';
import { ActiveSkill, SkillApplies, SkillCalcContext } from '../../../Skill';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../../../player/Player';
import { WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';

export class DashSkill extends ActiveSkill {
    public readonly id: number = SkillEnum.DASH;

    public readonly levelStep: number = 1;
    public readonly maxLevel: number = 1;
    public readonly levelLimit: number = 0;
    public readonly splashRange: number = 200;
    public readonly range: number = 0;
    public readonly maxHit: number = 4;
    public readonly damageType: SkillDamageTypeEnum = SkillDamageTypeEnum.MELEE;
    public readonly flags: Set<SkillFlagsEnum> = new Set([
        SkillFlagsEnum.ATTACK,
        SkillFlagsEnum.USE_MELEE_DAMAGE,
        SkillFlagsEnum.SPLASH,
        SkillFlagsEnum.CRUSH,
    ]);
    public readonly affects: Set<SkillAffectEnum> = new Set([SkillAffectEnum.TANHWAN_DASH]);
    public readonly applies: Set<SkillApplies> = new Set([
        {
            // primary apply (bPointOn): the strike's damage, dealt once the charge is released on a target
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.HEALTH,
            calculateAmount: (context: SkillCalcContext): number =>
                -(
                    2 * context.attack +
                    (context.attack + context.dex * 3 + context.str * 7 + context.con) * context.skillLevel
                ),
            calculateDuration: (): number => 0,
        },
        {
            // secondary apply (bPointOn2): the dash buff granted while charging (AFF_TANHWAN_DASH, see affects above)
            kind: SkillApplyKindEnum.POINT,
            pointOn: PointsEnum.MOVE_SPEED,
            calculateAmount: (): number => 150,
            //TODO: replace with the real duration formula (kDurationPoly2) once skill proto data is ported
            calculateDuration: (): number => 3,
        },
    ]);

    calculateSplashAroundDamageAdjust(): number {
        return 1;
    }

    calculateCooldown(): number {
        return 12;
    }

    calculateManaCost(context: SkillCalcContext): number {
        return 60 + 120 * context.skillLevel;
    }

    calculateDurationManaCost(): number {
        return 0;
    }

    canBeUsedBy(player: Player): boolean {
        return player.isWarrior() && player.getSkillGroup() === WarriorSubJobEnum.BODY;
    }

    isChargeSkill(): boolean {
        return true;
    }
}
