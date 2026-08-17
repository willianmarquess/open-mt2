import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { SkillAffectEnum, SKILL_AFFECT_TO_AFFECT_BITS_TYPE } from '@/core/enum/SkillAffectEnum';
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
    /** Target-relative fields, only meaningful while attacking a specific victim (e.g. Ambush's backstab bonus). Absent outside of an attack computation. */
    readonly isBehindTarget?: boolean;
    readonly isInvisible?: boolean;
    readonly hasDagger?: boolean;
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

    isChargeSkill(): boolean {
        return false;
    }

    /** Hardcoded by vnum in the original too (SKILL_CHAIN), not a flag - only Lightning Claw uses this. */
    isChainSkill(): boolean {
        return false;
    }

    /**
     * Hardcoded by vnum in the original too (SKILL_MUYEONG, char_skill.cpp:2137-2154 and
     * char_affect.cpp:646-652): a self-cast that only starts a toggle affect and its own periodic
     * "find the nearest enemy and burst it" tick, bypassing the generic apply-on-self flow entirely
     * - only FlameSpiritSkill uses this.
     */
    isPeriodicAreaSkill(): boolean {
        return false;
    }

    /**
     * Hardcoded by vnum in the original too (SKILL_BYEURAK, char_skill.cpp:2508-2515): every plain
     * (non-selfonly) ATTACK skill normally only computes its damage later, off the Attack/Shoot
     * packet's hit phase (see PlayerSkill.useSkillAttack) - this is the one exception the original
     * still resolves immediately against the cast's own target, at UseSkill time. Only Summon
     * Lightning uses this.
     */
    resolvesInstantlyOnCast(): boolean {
        return false;
    }

    /**
     * The runtime AffectBitsTypeEnum flag this skill's own buff/toggle is tracked under, derived
     * from the first entry of `affects` that has a known mapping. Single source of truth: skill
     * classes declare `affects` once and every apply/toggle-off check shares this same resolution,
     * instead of repeating the flag on each apply and again in a separate field.
     */
    getAffectFlag(): AffectBitsTypeEnum | undefined {
        for (const affect of this.affects) {
            const flag = SKILL_AFFECT_TO_AFFECT_BITS_TYPE[affect];
            if (flag !== undefined) return flag;
        }
        return undefined;
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

    public canBeUsedByHorse(): boolean {
        return false;
    }
}
