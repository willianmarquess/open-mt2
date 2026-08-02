import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillAffectEnum } from '@/core/enum/SkillAffectEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';

import Player from '../player/Player';
import GameEntity from '../GameEntity';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';

export interface SkillCalcContext {
    readonly skillLevel: number; // k
    readonly casterLevel: number; // lv
    readonly attack: number; //attack
    readonly str: number;
    readonly int: number;
    readonly dex: number;
    readonly con: number;
    readonly weaponAttack: number;
    readonly magicWeaponAttack: number;
    readonly defense: number;
    readonly horseLevel: number;
    readonly attackRating: number;
    readonly maxHealth: number;
    readonly maxMana: number;
    readonly chain: number;
    readonly ek?: number; //invisible
}

type SkillAppliesKindSpecial = {
    readonly kind: SkillApplyKindEnum.SPECIAL;
    calculateAmount?(context: SkillCalcContext): number;
    calculateDuration?(context: SkillCalcContext): number;
    calculateChance?(context: SkillCalcContext): number;
};

type SkillAppliesKindPoint = {
    readonly kind: SkillApplyKindEnum.POINT;
    readonly pointOn: PointsEnum;
    calculateAmount(context: SkillCalcContext): number;
    calculateDuration(context: SkillCalcContext): number;
};

type SkillAppliesKindStatus = {
    readonly kind: SkillApplyKindEnum.STATUS;
    readonly effect: SkillStatusEffectEnum;
    calculateChance(context: SkillCalcContext): number;
    calculateAmount?(context: SkillCalcContext): number;
    calculateDuration(context: SkillCalcContext): number;
};

export type SkillApplies = SkillAppliesKindPoint | SkillAppliesKindStatus | SkillAppliesKindSpecial;

export abstract class Skill {
    public abstract readonly type: SkillTypeEnum;
    public abstract readonly id: number;
    public abstract readonly maxLevel: number;
    public abstract readonly levelStep: number;
    public abstract readonly levelLimit: number;
    public abstract readonly range: number;
    public abstract readonly flags: Set<SkillFlagsEnum>;
    public abstract readonly applies: Set<SkillApplies>;
    public abstract readonly affects: Set<SkillAffectEnum>;
    public abstract canBeUsedBy(entity: GameEntity): boolean;

    isPassive(): this is PassiveSkill {
        return this.type === SkillTypeEnum.PASSIVE;
    }

    isActive(): this is ActiveSkill {
        return this.type === SkillTypeEnum.ACTIVE;
    }
}

export abstract class PassiveSkill extends Skill {
    public readonly type = SkillTypeEnum.PASSIVE;
}

export abstract class ActiveSkill extends Skill {
    public readonly type = SkillTypeEnum.ACTIVE;
    public abstract readonly splashRange: number;
    public abstract readonly maxHit: number;
    public abstract readonly damageType: SkillDamageTypeEnum;
    public abstract calculateCooldown(context: SkillCalcContext): number;
    public abstract calculateDurationManaCost(context: SkillCalcContext): number;
    public abstract calculateManaCost(context: SkillCalcContext): number;
    public abstract calculateSplashAroundDamageAdjust(context: SkillCalcContext): number;
    public abstract canBeUsedBy(player: Player): boolean;
}
