import MathUtil from '@/core/domain/util/MathUtil';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import Player from '../Player';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { ActiveSkill, Skill, SkillApplies, SkillCalcContext } from '../../skill/Skill';
import { SkillApplyKindEnum } from '@/core/enum/SkillApplyKindEnum';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { SkillState } from '../../../state/player/PlayerState';
import { SkillRankEnum } from '@/core/enum/SkillRankEnum';
import { SKILL_MAX_LEVEL, SKILL_POWER_BY_LEVEL } from '@/core/util/Constants';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import { SkillDamageTypeEnum } from '@/core/enum/SkillDamageTypeEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';
import { ItemSubTypeEnum } from '@/core/enum/ItemSubTypeEnum';
import Monster from '../../mob/Monster';
import { FlyEnum } from '@/core/enum/FlyEnum';

class SkillUseInfo {
    skillProto: Skill;
    wasUsed: boolean;
    nextUsableTime: number;
    targetMap: Map<number, number>;
    mainTarget: number | null;

    constructor(skillProto: Skill) {
        this.skillProto = skillProto;
        this.wasUsed = false;
        this.nextUsableTime = 0;
        this.targetMap = new Map<number, number>();
        this.mainTarget = null;
    }

    useSkill(coolTime: number): boolean {
        const currentTime = performance.now() / 1000;
        // Mirrors the original's `bUsed && dwNextSkillUsableTime > dwCur`: bUsed alone never blocks
        // reuse, it only gates whether the cooldown check applies (bUsed starts false, so the very
        // first use always goes through regardless of nextUsableTime).
        if (this.wasUsed && currentTime < this.nextUsableTime) return false;
        this.wasUsed = true;

        if (coolTime > 0) {
            this.nextUsableTime = currentTime + coolTime;
        } else {
            this.nextUsableTime = 0;
        }

        return true;
    }

    clearTargets() {
        this.targetMap.clear();
    }

    setMainTarget(mainTarget: number) {
        this.mainTarget = mainTarget;
    }
}

export class PlayerSkill {
    private readonly player: Player;
    private readonly skillManager: SkillManager;
    private readonly skillUseInfoMap: Map<SkillEnum, SkillUseInfo> = new Map<SkillEnum, SkillUseInfo>();
    private lastSkillUseTime: number = 0;

    private readonly skills: Array<SkillState> = Array.from({ length: 255 }, () => ({
        rank: SkillRankEnum.NORMAL,
        level: 0,
        timeToNextRead: 0,
        readCount: 0,
    }));

    constructor({
        player,
        skillManager,
        skills,
    }: {
        player: Player;
        skillManager: SkillManager;
        skills: Array<SkillState>;
    }) {
        this.player = player;
        this.skillManager = skillManager;
        this.skills =
            skills?.length > 0
                ? skills
                : Array.from({ length: 255 }, () => ({
                      rank: SkillRankEnum.NORMAL,
                      level: 0,
                      timeToNextRead: 0,
                      readCount: 0,
                  }));
    }

    getSkills(): Array<SkillState> {
        return this.skills;
    }

    getSkillLevel(skillNum: SkillEnum): number {
        return this.skills[skillNum]?.level || 0;
    }

    setSkillLevel(skillNum: SkillEnum, level: number) {
        if (!this.skills[skillNum]) {
            this.skills[skillNum] = {
                level: 0,
                rank: SkillRankEnum.NORMAL,
                timeToNextRead: 0,
                readCount: 0,
            };
        }

        this.skills[skillNum].level = Math.min(level, SKILL_MAX_LEVEL);

        switch (true) {
            case level >= 40:
                this.skills[skillNum].rank = SkillRankEnum.PERFECT_MASTER;
                break;
            case level >= 30:
                this.skills[skillNum].rank = SkillRankEnum.GRAND_MASTER;
                break;
            case level >= 20:
                this.skills[skillNum].rank = SkillRankEnum.MASTER;
                break;
            default:
                this.skills[skillNum].rank = SkillRankEnum.NORMAL;
                break;
        }
    }

    skillLevelUp(skillNum: SkillEnum, method: 'BOOK' | 'POINT' = 'POINT') {
        if (this.player.isPolymorphed()) return;

        //TODO: anti skill

        if (!this.isLearnableSkill(skillNum)) return;

        if (!this.skills[skillNum]) return;

        if (this.skills[skillNum].rank === SkillRankEnum.PERFECT_MASTER) return;

        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return;

        switch (method) {
            case 'BOOK':
                if (!this.canLevelUpByBook(skillNum, skillProto)) return;
                break;
            case 'POINT':
                if (!this.canLevelUpByPoint(skillNum, skillProto)) return;
                break;
            default:
                break;
        }

        if (this.player.getPoint(PointsEnum.LEVEL) < skillProto.levelLimit) return;

        //TODO: add pre skill logic

        if (!this.hasSkillGroup()) return;

        if (method === 'POINT') {
            let point: PointsEnum = PointsEnum.SKILL;

            if (skillProto.type === SkillTypeEnum.PASSIVE) {
                point = PointsEnum.SUB_SKILL;
            } else if (skillProto.type === SkillTypeEnum.HORSE) {
                point = PointsEnum.HORSE_SKILL;
            }

            if (this.player.getPoint(point) < 1) return;
            this.player.addPoint(point, -1);
        }

        this.skills[skillNum].level++;

        if (!skillProto.isPassive()) {
            switch (this.skills[skillNum].rank) {
                case SkillRankEnum.NORMAL:
                    //TODO: reset_scroll.force_to_master_skill quest flag behavior
                    if (this.skills[skillNum].level >= 17) {
                        //TODO: for now we will just set the skill to 20, but we need to implement the random chance to level up to 20
                        // if (MathUtil.getRandomInt(1, 21 - Math.min(20, this.skills[skillNum].level)) === 1) {
                        this.setSkillLevel(skillNum, 20);
                        // }
                    }
                    break;
                case SkillRankEnum.MASTER:
                    if (this.skills[skillNum].level >= 30) {
                        if (MathUtil.getRandomInt(1, 31 - Math.min(30, this.skills[skillNum].level)) === 1) {
                            this.setSkillLevel(skillNum, 30);
                        }
                    }
                    break;
                case SkillRankEnum.GRAND_MASTER:
                    if (this.skills[skillNum].level >= 40) {
                        this.setSkillLevel(skillNum, 40);
                    }
                    break;
            }
        }

        this.player.save();
        this.player.sendPoints();
        this.player.sendSkillLevel();
    }

    private canLevelUpByBook(skillNum: SkillEnum, skillProto: Skill): boolean {
        // A passive never leaves NORMAL rank, so the MASTER gate can only apply
        // to active skills.
        if (skillProto.isPassive()) return true;
        return this.skills[skillNum]?.rank === SkillRankEnum.MASTER;
    }

    private canLevelUpByPoint(skillNum: SkillEnum, skillProto: Skill): boolean {
        const isNormalRank = this.skills[skillNum]?.rank === SkillRankEnum.NORMAL;
        const isDisabled = skillProto.flags.has(SkillFlagsEnum.DISABLE_BY_POINT_UP);

        return isNormalRank && !isDisabled;
    }

    isLearnableSkill(skillNum: SkillEnum): boolean {
        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return false;

        if (this.skills[skillNum]?.level >= SKILL_MAX_LEVEL) return false;

        if (skillProto.isPassive() && this.skills[skillNum]?.level >= skillProto.maxLevel) return false;

        //TODO ANTI SKILL

        return skillProto.canBeUsedBy(this.player);
    }

    //TODO verify if this is used
    // learnHorseSkillByBook(): boolean {
    //     if (this.player.isPolymorphed()) {
    //         this.player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `You can't train your horse while transformed.` });
    //         return false;
    //     }

    //     if (this.player.getPoint(PointsEnum.LEVEL) < 50) {
    //         this.player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `You need to be level 50 to train your horse.` });
    //         return false;
    //     }

    //     const skillNum: SkillEnum = SkillEnum.HORSE;

    //     const skillProto = this.skillManager.getSkill(skillNum);

    //     if (!skillProto) return false;

    //     if (!this.isLearnableSkill(skillNum)) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.NORMAL,
    //             message: 'You cannot train this skill.',
    //         });
    //         return false;
    //     }

    //     const time = performance.now();

    //     if (time < this.skills[skillNum].timeToNextRead) {
    //         const messages = this.getNeedToWaitMoreTimeMessages(this.skills[skillNum].timeToNextRead - time);

    //         messages.forEach((message) => {
    //             this.player.chat({
    //                 messageType: ChatMessageTypeEnum.NORMAL,
    //                 message,
    //             });
    //         });

    //         return false;
    //     }

    //     if (this.skills[skillNum].level >= 20 || this.player.getPoint(PointsEnum.HORSE_SKILL) >= 20) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You cannot read any more Riding Guides.',
    //         });
    //         return false;
    //     }

    //     const percent = 65;

    //     if (MathUtil.getRandomInt(1, 100) <= percent) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You read the Horse Riding Manual and received a Riding Point.',
    //         });
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You can use this point to improve your riding skill!',
    //         });
    //         this.player.addPoint(PointsEnum.HORSE_SKILL, 1);
    //         this.skills[skillNum].level++;
    //         this.skills[skillNum].readCount = 0;
    //         const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
    //         this.setSkillNextReadTime(skillNum, performance.now() + delay);
    //         this.player.save();
    //         this.player.sendPoints();
    //         this.player.sendSkillLevel();
    //         return true;
    //     }

    //     this.player.chat({
    //         messageType: ChatMessageTypeEnum.INFO,
    //         message: 'You did not understand the riding guide.',
    //     });
    //     return false;
    // }

    learnSkillByBook(skillNum: SkillEnum, probability: number = 0) {
        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return false;

        if (!this.isLearnableSkill(skillNum)) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot train this skill.',
            });
            return false;
        }

        const neededExp = 20000;

        if (this.player.getPoint(PointsEnum.EXPERIENCE) < neededExp) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot read this due to your lack of experience.',
            });
            return false;
        }

        if (!skillProto.isPassive() && this.skills[skillNum].rank > SkillRankEnum.MASTER) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot train this skill with a Book.',
            });
            return false;
        }

        if (!skillProto.isPassive() && this.skills[skillNum].rank < SkillRankEnum.MASTER) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'This skill level is not high enough to be trained with a Book.',
            });
            return false;
        }

        const time = Math.floor(Date.now() / 1000);

        if (time < this.skills[skillNum].timeToNextRead) {
            //TODO: verify AFFECT_SKILL_NO_BOOK_DELAY caused by Exorcism Scroll (we need to impl PlayerAffect class)
            const messages = this.getNeedToWaitMoreTimeMessages(this.skills[skillNum].timeToNextRead - time);

            messages.forEach((message) => {
                this.player.chat({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message,
                });
            });

            return false;
        }

        const lastLevel = this.skills[skillNum]?.level || 0;

        if (probability !== 0) {
            //TODO: get skill book bonus from affects

            if (MathUtil.getRandomInt(1, 100) <= probability) {
                this.skillLevelUp(skillNum, 'BOOK');
            }
        } else {
            const neededCount = lastLevel - 20;

            const percent = 65;

            //TODO: if AFFECT_SKILL_BOOK_BONUS -> percent = 0;

            this.player.addPoint(PointsEnum.EXPERIENCE, -neededExp);

            if (MathUtil.getRandomInt(1, 100) > percent) {
                if (this.skills[skillNum].readCount >= neededCount) {
                    this.skillLevelUp(skillNum, 'BOOK');
                    this.skills[skillNum].readCount = 0;
                    this.player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: `You have successfully finished your training with the Book.`,
                    });
                } else {
                    this.skills[skillNum].readCount++;

                    switch (MathUtil.getRandomInt(1, 3)) {
                        case 1:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `I'm making progress, but I still haven't understood everything.`,
                            });
                            break;

                        case 2:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `These instructions are difficult to understand. I have to carry on studying.`,
                            });
                            break;

                        case 3:
                        default:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `I understand this chapter. But I've got to carry on working hard.`,
                            });
                            break;
                    }
                }
                return true;
            }
        }

        if (lastLevel != this.skills[skillNum].level) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `My body is full of energy!`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `The training seems to be working already...`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You have successfully finished your training with the Book.`,
            });
        } else {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `That did not work. Damn!`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Training has failed. Please try again later.`,
            });
        }

        return true;
    }

    private resetSkill() {
        for (const skill of this.skills) {
            skill.level = 0;
            skill.rank = SkillRankEnum.NORMAL;
            skill.readCount = 0;
            skill.timeToNextRead = 0;
        }

        this.player.sendPoints();
        this.player.sendSkillLevel();
    }

    clearSkill() {
        this.player.addPoint(
            PointsEnum.SKILL,
            4 + (this.player.getPoint(PointsEnum.LEVEL) - 5) - this.player.getPoint(PointsEnum.SKILL),
        );
        this.resetSkill();
    }

    hasSkillGroup(): boolean {
        return this.player.getSkillGroup() > 0;
    }

    calculateCooltime(time: number): number {
        return MathUtil.calcDuration(this.player.getPoint(PointsEnum.CASTING_SPEED), time);
    }

    getNeedToWaitMoreTimeMessages(time: number) {
        const messages: Array<string> = [];

        if (time < 3 * 60)
            messages.push('I am burning inside, but it is calming down my body. My Chi has to stabilise.');
        else if (time < 5 * 60) messages.push('A little slow, but steady... Without stopping!');
        else if (time < 10 * 60) messages.push('Yes, that feels great. My body is full of Chi.');
        else if (time < 30 * 60) {
            messages.push('I have read it! Now the Chi will spread through my body.');
            messages.push('The training is completed.');
        } else if (time < 1 * 3600)
            messages.push('I am on the last page of the book. The training is nearly finished!');
        else if (time < 2 * 3600) messages.push('Nearly finished! Just a little bit more to go!');
        else if (time < 3 * 3600) messages.push('Eureka! I have nearly finished reading it!');
        else if (time < 6 * 3600) {
            messages.push(`Only a few more pages and then I'll have read everything.`);
            messages.push('I feel refreshed.');
        } else if (time < 12 * 3600) {
            messages.push('Now I understand it!');
            messages.push('Okay I have to stay concentrated!');
        } else if (time < 18 * 3600) {
            messages.push('I keep reading the same line over and over again.');
            messages.push('I do not want to learn any more.');
        } else {
            messages.push('It is a lot more complicated and more difficult to understand than I thought.');
            messages.push(`It's hard for me to concentrate.I should take a break.`);
        }

        return messages;
    }

    setSkillNextReadTime(skillNum: SkillEnum, time: number) {
        this.skills[skillNum].timeToNextRead = time;
    }

    canUseSkill(skillProto: Skill): boolean {
        if (this.player.isPolymorphed()) return false;
        if (this.player.isDead()) return false;
        if (this.player.getPrivateShop()) return false;
        if (this.player.isAffectByFlag(AffectBitsTypeEnum.STUN)) return false;
        if (!skillProto.flags.has(SkillFlagsEnum.ATTACK) && this.player.isAffectByFlag(AffectBitsTypeEnum.DISPEL)) {
            return false;
        }
        return skillProto.canBeUsedBy(this.player);
    }

    useSkill(skillNum: SkillEnum, target?: Player | Monster): boolean {
        const skillProto = this.skillManager.getSkill(skillNum);
        if (!skillProto || !skillProto.isActive()) return false;
        if (!this.canUseSkill(skillProto)) return false;
        if (this.getSkillLevel(skillNum) < 1) return false;

        // TODO: mining validation

        if (!this.skillUseInfoMap.has(skillNum)) {
            this.skillUseInfoMap.set(skillNum, new SkillUseInfo(skillProto));
        }

        const skillUseInfo = this.skillUseInfoMap.get(skillNum)!;

        skillUseInfo.clearTargets();

        const used = skillProto.isChargeSkill()
            ? this.useChargeSkill(skillProto, skillUseInfo, target)
            : this.useRegularActiveSkill(skillProto, skillUseInfo, target);

        if (used) {
            this.cancelInvisibilityFromSkillUse(skillProto);
        }

        return used;
    }

    /**
     * Mirrors CHARACTER::OnMove(true) canceling AFF_EUNHYUNG the moment an attack action fires
     * (char.cpp:4659-4682): using any skill breaks stealth, except the stealth toggle itself turning
     * it on (its own tryToggleOff already handles turning it back off on a second press).
     */
    private cancelInvisibilityFromSkillUse(skillProto: ActiveSkill): void {
        if (skillProto.getAffectFlag() === AffectBitsTypeEnum.STEALTH) return;
        if (!this.player.isAffectByFlag(AffectBitsTypeEnum.STEALTH)) return;

        this.player.removeAffect(AffectBitsTypeEnum.STEALTH);
    }

    private useRegularActiveSkill(
        skillProto: ActiveSkill,
        skillUseInfo: SkillUseInfo,
        target?: Player | Monster,
    ): boolean {
        if (this.tryToggleOff(skillProto)) return true;

        const isSelfOnly = skillProto.flags.has(SkillFlagsEnum.SELFONLY);
        const isAttack = skillProto.flags.has(SkillFlagsEnum.ATTACK);

        if (isAttack && !isSelfOnly && !target) return false;

        const context = this.buildSkillCalcContext(skillProto);

        if (!this.payActivationCost(skillProto, skillUseInfo, context)) return false;

        this.lastSkillUseTime = performance.now();

        const effectiveTarget = isSelfOnly ? this.player : (target ?? this.player);

        skillUseInfo.setMainTarget(effectiveTarget.getVirtualId());

        if (skillProto.isPeriodicAreaSkill()) {
            // SKILL_MUYEONG/FlameSpiritSkill (char_skill.cpp:2137-2154): the cast itself only starts
            // the toggle affect - never runs the apply list against the caster. The affect's own
            // duration comes from this same apply's calculateDuration (see FlameSpiritSkill's
            // comment); the enemy-facing calculateAmount is only used later, per tick, in tickFlameSpirit().
            //TODO: the original also drains SP every second while this is active
            // (kDurationSPCostPoly/lSPCost, char_affect.cpp:280-286) - no affect carries an upkeep
            // cost yet anywhere in this codebase, so that part isn't ported.
            const [primaryApply] = skillProto.applies;
            const duration =
                primaryApply?.kind === SkillApplyKindEnum.POINT ? primaryApply.calculateDuration(context) : 0;
            const flag = skillProto.getAffectFlag();

            if (duration > 0 && flag !== undefined) {
                this.player.addAffect({ flag, duration });
            }

            return true;
        }

        if (isSelfOnly && isAttack) {
            // Self-centered AoE (FlameStrike/Stump/DragonRoar/...): despite being cast on self, the
            // original still routes these through the attack branch (char_skill.cpp:2022-2023 only
            // excludes SKILL_MUYEONG and charge skills when pkVictim==this) - FuncSplashDamage then
            // centers on the caster's own position and hits nearby enemies, never the caster.
            for (const enemy of this.getSplashTargetsAroundSelf(skillProto)) {
                this.computeSkill(skillProto, enemy, context, false);
            }
        } else if (isSelfOnly || !isAttack) {
            for (const splashTarget of this.getSplashTargets(skillProto, effectiveTarget)) {
                this.computeSkill(skillProto, splashTarget, context, splashTarget === effectiveTarget);
            }
        } else if (skillProto.resolvesInstantlyOnCast()) {
            // SKILL_BYEURAK (char_skill.cpp:2512-2513): the one plain ATTACK skill the original
            // still resolves at cast time - every other non-selfonly ATTACK skill only reaches
            // computeSkill later, via the Attack/Shoot packet's hit phase (useSkillAttack()).
            this.resolveAttackDamage(skillProto, effectiveTarget, context);
        }
        // A plain (non-self-only, non-instant) ATTACK skill's damage isn't computed here - it's
        // deferred to useSkillAttack(), triggered by the Attack/Shoot packet that lands the hit.

        return true;
    }

    /**
     * Self-centered AoE targets (FlameStrike/Stump/DragonRoar/...): mirrors FuncSplashDamage
     * centered on the caster's own position (char_skill.cpp:990-1162) - every attackable monster in
     * range gets hit, the caster never does (matches battle_is_attackable always excluding the
     * attacker from their own splash). None of these hits count as the "main" target (the original
     * only marks one via SetMainTargetVID from the Attack/Shoot packets, never from a plain
     * self-cast), so every hit goes through the splash-around damage adjust.
     * PvP is out of scope here (like getSplashTargets), so only monsters are considered.
     */
    private getSplashTargetsAroundSelf(skillProto: ActiveSkill): Array<Monster> {
        if (skillProto.splashRange <= 0) return [];

        const targets: Array<Monster> = [];

        for (const entity of this.player.getNearbyEntities().values()) {
            if (targets.length >= skillProto.maxHit) break;
            if (!entity.isMonster()) continue;

            const distance = MathUtil.calcDistance(
                this.player.getPositionX(),
                this.player.getPositionY(),
                entity.getPositionX(),
                entity.getPositionY(),
            );
            if (distance <= skillProto.splashRange) targets.push(entity);
        }

        return targets;
    }

    private static readonly FLAME_SPIRIT_TICK_ID = 'FLAME_SPIRIT_TICK';
    // The original reschedules skill_muyoung_event every PASSES_PER_SEC(3) after its first (1s) run
    // (char_skill.cpp:2629,2640); this timer API only supports one fixed cadence, so it just ticks
    // steadily every 3s from the start.
    private static readonly FLAME_SPIRIT_TICK_INTERVAL_MS = 3000;

    /**
     * Mirrors StartMuyeongEvent (char_skill.cpp:2632-2641): begins the periodic "find the nearest
     * enemy and burst it" tick tied to the AFF_MUYEONG toggle. Started/stopped from
     * Player.onAffectAdded/onAffectRemoved whenever that flag changes (mirroring ComputeAffect's
     * own dwType==SKILL_MUYEONG check, char_affect.cpp:646-652).
     */
    startFlameSpiritTick(): void {
        if (this.player.isEventTimerActive(PlayerSkill.FLAME_SPIRIT_TICK_ID)) return;

        this.player.addEventTimer({
            id: PlayerSkill.FLAME_SPIRIT_TICK_ID,
            eventFunction: () => this.tickFlameSpirit(),
            options: { interval: PlayerSkill.FLAME_SPIRIT_TICK_INTERVAL_MS },
        });
    }

    /** Mirrors StopMuyeongEvent (char_skill.cpp:2643-2646). */
    stopFlameSpiritTick(): void {
        this.player.removeEventTimer(PlayerSkill.FLAME_SPIRIT_TICK_ID);
    }

    /**
     * Mirrors skill_muyoung_event (char_skill.cpp:2594-2630): every tick, pick one random
     * attackable monster nearby, show the fireball flying to it (the client renders the actual
     * orbiting-fireball visual off the AFF_MUYEONG affect bit itself, not off this fly effect - this
     * is only the "shot fired" projectile), and burst it with the skill's own damage formula.
     */
    private tickFlameSpirit(): void {
        if (!this.player.isAffectByFlag(AffectBitsTypeEnum.FLAME_SPIRIT)) {
            this.stopFlameSpiritTick();
            return;
        }

        const skillProto = this.skillManager.getSkill(SkillEnum.FLAME_SPIRIT);
        if (!skillProto || !skillProto.isActive()) return;

        const victim = this.findRandomNearbyMonster();
        if (!victim) return;

        this.player.createFlyEffect(victim.getVirtualId(), FlyEnum.FLAME_SPIRIT);

        const context = this.buildSkillCalcContext(skillProto);
        this.computeSkill(skillProto, victim, context, false);
    }

    /**
     * Mirrors FFindNearVictim (char_skill.cpp:835-892): picks a uniformly random attackable monster
     * within range via reservoir sampling, so every equally-near candidate has the same odds instead
     * of always picking the first one found.
     */
    private findRandomNearbyMonster(): Monster | undefined {
        let picked: Monster | undefined;
        let count = 0;

        for (const entity of this.player.getNearbyEntities().values()) {
            if (!entity.isMonster()) continue;

            const distance = MathUtil.calcDistance(
                this.player.getPositionX(),
                this.player.getPositionY(),
                entity.getPositionX(),
                entity.getPositionY(),
            );
            if (distance >= 1000) continue;

            count++;
            if (count === 1 || MathUtil.getRandomInt(1, count) === 1) picked = entity;
        }

        return picked;
    }

    useSkillAttack(skillNum: SkillEnum, target: Player | Monster): boolean {
        const skillProto = this.skillManager.getSkill(skillNum);
        if (!skillProto || !skillProto.isActive()) return false;
        if (!skillProto.flags.has(SkillFlagsEnum.ATTACK)) return false;
        if (!this.canUseSkill(skillProto)) return false;
        if (this.getSkillLevel(skillNum) < 1) return false;

        if (performance.now() - this.lastSkillUseTime > 1500) return false;

        if (!this.skillUseInfoMap.has(skillNum)) {
            this.skillUseInfoMap.set(skillNum, new SkillUseInfo(skillProto));
        }
        const skillUseInfo = this.skillUseInfoMap.get(skillNum)!;
        skillUseInfo.setMainTarget(target.getVirtualId());

        const context = this.buildSkillCalcContext(skillProto);

        this.resolveAttackDamage(skillProto, target, context);

        return true;
    }

    /** Splashes damage around `target` and, for a chain skill, kicks off its own hop sequence. Shared
     * by useSkillAttack() (the normal Attack/Shoot hit phase) and useRegularActiveSkill()'s
     * resolvesInstantlyOnCast() branch (SKILL_BYEURAK, the one ATTACK skill that resolves at cast
     * time instead). */
    private resolveAttackDamage(skillProto: ActiveSkill, target: Player | Monster, context: SkillCalcContext): void {
        for (const splashTarget of this.getSplashTargets(skillProto, target)) {
            this.computeSkill(skillProto, splashTarget, context, splashTarget === target);
        }

        if (skillProto.isChainSkill()) {
            this.scheduleNextChainHit(skillProto, target, new Set([target.getVirtualId()]), 1, context);
        }
    }

    private scheduleNextChainHit(
        skillProto: ActiveSkill,
        fromVictim: Player | Monster,
        except: Set<number>,
        chainIndex: number,
        context: SkillCalcContext,
    ): void {
        if (chainIndex >= skillProto.maxHit) return;

        this.player.addEventTimer({
            id: `CHAIN_${skillProto.id}`,
            eventFunction: () => {
                if (this.player.isDead() || fromVictim.isDead()) return;

                const nextTarget = this.findNextChainTarget(fromVictim, except);
                if (!nextTarget) return;

                except.add(nextTarget.getVirtualId());
                this.computeSkill(skillProto, nextTarget, { ...context, chain: chainIndex }, true);
                this.scheduleNextChainHit(skillProto, nextTarget, except, chainIndex + 1, context);
            },
            options: { interval: 200, duration: 200, repeatCount: 1 },
        });
    }

    private findNextChainTarget(from: Player | Monster, except: Set<number>): Player | Monster | undefined {
        let picked: Player | Monster | undefined;
        let count = 0;

        for (const entity of from.getNearbyEntities().values()) {
            if (except.has(entity.getVirtualId())) continue;
            if (entity.getEntityType() !== from.getEntityType()) continue;
            if (!(entity.isPlayer() || entity.isMonster())) continue;

            const distance = MathUtil.calcDistance(
                from.getPositionX(),
                from.getPositionY(),
                entity.getPositionX(),
                entity.getPositionY(),
            );
            if (distance >= 1000) continue;

            count++;
            if (count === 1 || MathUtil.getRandomInt(1, count) === 1) {
                picked = entity;
            }
        }

        return picked;
    }

    /** TOGGLE skills turn off (no cost paid) when used again while their affect is already active. */
    private tryToggleOff(skillProto: ActiveSkill): boolean {
        if (!skillProto.flags.has(SkillFlagsEnum.TOGGLE)) return false;

        const flag = skillProto.getAffectFlag();
        if (flag === undefined) return false;
        if (!this.player.isAffectByFlag(flag)) return false;

        this.player.removeAffect(flag);
        return true;
    }

    private useChargeSkill(skillProto: ActiveSkill, skillUseInfo: SkillUseInfo, target?: Player | Monster): boolean {
        const isDashing = this.player.isAffectByFlag(AffectBitsTypeEnum.TANHWAN_DASH);
        const isStriking = isDashing || (!!target && target !== this.player);

        if (!isStriking) {
            return this.activateChargeSkill(skillProto, skillUseInfo);
        }

        if (!target) return false;

        if (!isDashing && !this.activateChargeSkill(skillProto, skillUseInfo)) {
            return false;
        }

        skillUseInfo.setMainTarget(target.getVirtualId());

        const context = this.buildSkillCalcContext(skillProto);
        for (const splashTarget of this.getSplashTargets(skillProto, target)) {
            this.computeSkill(skillProto, splashTarget, context, splashTarget === target);
        }

        this.player.removeAffect(AffectBitsTypeEnum.TANHWAN_DASH);
        return true;
    }

    /** Pays the cost/cooldown and applies the charge skill's own affect (e.g. the dash speed buff) to self. */
    private activateChargeSkill(skillProto: ActiveSkill, skillUseInfo: SkillUseInfo): boolean {
        const context = this.buildSkillCalcContext(skillProto);

        if (!this.payActivationCost(skillProto, skillUseInfo, context)) return false;

        this.computeSkill(skillProto, this.player, context);
        return true;
    }

    /** Mirrors SetPolyVarForAttack's "wep"/"mwep": a weapon dice roll plus its refine bonus, one for each damage line printed on the item. */
    private buildSkillCalcContext(skillProto: ActiveSkill): SkillCalcContext {
        const weaponValues = this.player.getWeaponValues();

        return {
            skillLevel: (SKILL_POWER_BY_LEVEL[this.getSkillLevel(skillProto.id)] * skillProto.maxLevel) / 100,
            casterLevel: this.player.getLevel(),
            attack: this.player.getAttack(),
            str: this.player.getPoint(PointsEnum.ST),
            int: this.player.getPoint(PointsEnum.IQ),
            dex: this.player.getPoint(PointsEnum.DX),
            con: this.player.getPoint(PointsEnum.HT),
            weaponAttack:
                MathUtil.getRandomInt(weaponValues.physic.min, weaponValues.physic.max) + weaponValues.physic.bonus,
            magicWeaponAttack:
                MathUtil.getRandomInt(weaponValues.magic.min, weaponValues.magic.max) + weaponValues.magic.bonus,
            defense: this.player.getDefense(),
            horseLevel: this.player.getHorseLevel(),
            attackRating: this.player.getAttackRating(),
            maxHealth: this.player.getPoint(PointsEnum.MAX_HEALTH),
            maxMana: this.player.getPoint(PointsEnum.MAX_MANA),
            // Overridden per hop by scheduleNextChainHit for chain skills; every other skill hits once.
            chain: 0,
        };
    }

    /** Checks and pays the SP/HP cost, then starts the skill's cooldown. Mirrors CHARACTER::UseSkill's cost+cooldown block. */
    private payActivationCost(skillProto: ActiveSkill, skillUseInfo: SkillUseInfo, context: SkillCalcContext): boolean {
        const useHpAsCost = skillProto.flags.has(SkillFlagsEnum.USE_HP_AS_COST);
        const costPoint = useHpAsCost ? PointsEnum.HEALTH : PointsEnum.MANA;
        const cost = skillProto.calculateManaCost(context);

        if (this.player.getPoint(costPoint) < cost) return false;

        const cooldownMs = this.calculateCooltime(skillProto.calculateCooldown(context) * 1000);

        if (!skillUseInfo.useSkill(cooldownMs / 1000)) return false;

        this.player.addPoint(costPoint, -cost);
        return true;
    }

    private computeSkill(
        skillProto: ActiveSkill,
        target: Player | Monster,
        context: SkillCalcContext,
        isMainTarget: boolean = true,
    ): void {
        const isAttackOnOther = skillProto.flags.has(SkillFlagsEnum.ATTACK) && target !== this.player;
        const [primary, ...secondaries] = skillProto.applies;

        if (isAttackOnOther) {
            if (primary?.kind === SkillApplyKindEnum.POINT) {
                this.applyAttackPoint(skillProto, primary, secondaries, target, context, isMainTarget);
            }

            const canApplySecondaryEffects =
                !skillProto.isChargeSkill() && !target.isDead() && !target.isAffectByFlag(AffectBitsTypeEnum.STUN);

            if (canApplySecondaryEffects) {
                for (const apply of secondaries) {
                    this.applyEffect(skillProto, apply, target, context);
                }

                this.applyCrush(skillProto, target, isMainTarget);
            }

            return;
        }

        if (!skillProto.isChargeSkill() && primary) {
            this.applyEffect(skillProto, primary, target, context);
        }

        for (const apply of secondaries) {
            this.applyEffect(skillProto, apply, target, context);
        }
    }

    /** Dispatches a single apply by kind. POINT applies are buffs/heals; SPECIAL applies carry skill-wide effects (cleanse chance, self-flag duration). */
    private applyEffect(
        skillProto: ActiveSkill,
        apply: SkillApplies,
        target: Player | Monster,
        context: SkillCalcContext,
    ): void {
        switch (apply.kind) {
            case SkillApplyKindEnum.POINT:
                this.applyBuffPoint(skillProto, apply, target, context);
                return;
            case SkillApplyKindEnum.SPECIAL:
                this.applySpecialApply(skillProto, apply, target, context);
                return;
            case SkillApplyKindEnum.STATUS:
                this.applyStatusApply(apply, target, context);
                return;
        }
    }

    private applyStatusApply(
        apply: SkillApplies & { kind: SkillApplyKindEnum.STATUS },
        target: Player | Monster,
        context: SkillCalcContext,
    ): void {
        const chance = apply.calculateChance(context);
        if (MathUtil.getRandomInt(1, 100) > chance) return;

        switch (apply.effect) {
            case SkillStatusEffectEnum.STUN:
            case SkillStatusEffectEnum.SLOW:
                this.player.applySkillStatusEffect(apply.effect, target, apply.calculateDuration(context));
                return;
            case SkillStatusEffectEnum.POISON:
                this.player.applySkillStatusEffect(apply.effect, target);
                return;
            case SkillStatusEffectEnum.FIRE:
                this.player.applySkillStatusEffect(
                    apply.effect,
                    target,
                    apply.calculateDuration(context),
                    apply.calculateAmount?.(context),
                );
                return;
        }
    }

    private applyCrush(skillProto: ActiveSkill, target: Player | Monster, isMainTarget: boolean): void {
        const isCrush = skillProto.flags.has(SkillFlagsEnum.CRUSH) || skillProto.flags.has(SkillFlagsEnum.CRUSH_LONG);
        if (!isCrush) return;
        if (target.isMonster() && target.isImmovable()) return;

        const slidingLength = skillProto.flags.has(SkillFlagsEnum.CRUSH_LONG) ? 400 : 200;

        let degree = MathUtil.getDegreeFromPositionXY(
            this.player.getPositionX(),
            this.player.getPositionY(),
            target.getPositionX(),
            target.getPositionY(),
        );

        if (skillProto.id === SkillEnum.HORSE_WILDATTACK) {
            degree -= this.player.getRotation();
            degree = (degree % 360) - 180;
            degree = degree > 0 ? this.player.getRotation() + 90 : this.player.getRotation() - 90;
        }

        const { dx, dy } = MathUtil.getDeltaByDegree(degree, slidingLength);
        target.moveTo(target.getPositionX() + dx, target.getPositionY() + dy);

        if (isMainTarget) {
            this.player.applySkillStatusEffect(SkillStatusEffectEnum.STUN, target, 4);
        }
    }

    private applySpecialApply(
        skillProto: ActiveSkill,
        apply: SkillApplies & { kind: SkillApplyKindEnum.SPECIAL },
        target: Player | Monster,
        context: SkillCalcContext,
    ): void {
        const chance = apply.calculateChance?.(context) ?? apply.calculateAmount?.(context) ?? 0;

        if (skillProto.flags.has(SkillFlagsEnum.REMOVE_BAD_AFFECT)) {
            if (MathUtil.getRandomInt(1, 100) <= chance) {
                target.removeBadAffects();
            }
            return;
        }

        if (skillProto.flags.has(SkillFlagsEnum.REMOVE_GOOD_AFFECT)) {
            if (MathUtil.getRandomInt(1, 100) <= chance) {
                target.removeGoodAffects();

                const duration = apply.calculateDuration?.(context) ?? 0;
                if (duration > 0) {
                    target.addAffect({ flag: AffectBitsTypeEnum.DISPEL, duration });
                }
            }
            return;
        }

        const flag = skillProto.getAffectFlag();
        if (flag !== undefined) {
            const duration = apply.calculateDuration?.(context) ?? 0;
            if (duration > 0) {
                target.addAffect({ flag, duration });
            }
        }
    }

    private applyAttackPoint(
        skillProto: ActiveSkill,
        apply: SkillApplies & { kind: SkillApplyKindEnum.POINT },
        secondaries: Array<SkillApplies>,
        target: Player | Monster,
        context: SkillCalcContext,
        isMainTarget: boolean,
    ): void {
        if (apply.pointOn !== PointsEnum.HEALTH) {
            target.addPoint(apply.pointOn, apply.calculateAmount(context));
            return;
        }

        const chanceApply = secondaries[0];
        const rollChance =
            chanceApply?.kind === SkillApplyKindEnum.SPECIAL ? (chanceApply.calculateAmount?.(context) ?? 0) : 0;

        const ignoreDefense =
            skillProto.flags.has(SkillFlagsEnum.PENETRATE) && MathUtil.getRandomInt(1, 100) <= rollChance;
        const ignoreTargetRating =
            skillProto.flags.has(SkillFlagsEnum.IGNORE_TARGET_RATING) && MathUtil.getRandomInt(1, 100) <= rollChance;

        let attack = context.attack;
        if (skillProto.flags.has(SkillFlagsEnum.USE_MELEE_DAMAGE)) {
            attack = this.player.calculateMeleeAttack(target, ignoreTargetRating);
        } else if (skillProto.flags.has(SkillFlagsEnum.USE_ARROW_DAMAGE)) {
            attack = this.player.calculateArrowAttack(target);
        }

        const attackContext: SkillCalcContext = {
            ...context,
            attack,
            isBehindTarget: MathUtil.getDegreeDelta(this.player.getRotation(), target.getRotation()) < 35,
            isInvisible: this.player.isAffectByFlag(AffectBitsTypeEnum.STEALTH),
            hasDagger: this.player.getWeapon()?.getSubType() === ItemSubTypeEnum.WEAPON_DAGGER,
        };

        const amount = apply.calculateAmount(attackContext);

        if (amount >= 0) {
            target.addPoint(apply.pointOn, amount);
            return;
        }

        let damage = -amount;
        if (!isMainTarget) {
            damage *= skillProto.calculateSplashAroundDamageAdjust(attackContext);
        }

        this.player.applySkillDamage(damage, this.mapSkillDamageType(skillProto.damageType), target, ignoreDefense);

        if (skillProto.flags.has(SkillFlagsEnum.HP_ABSORB)) {
            this.player.addPoint(PointsEnum.HEALTH, (damage * rollChance) / 100);
        }
        if (skillProto.flags.has(SkillFlagsEnum.SP_ABSORB)) {
            this.player.addPoint(PointsEnum.MANA, (damage * rollChance) / 100);
        }
    }

    private mapSkillDamageType(damageType: SkillDamageTypeEnum): DamageTypeEnum {
        switch (damageType) {
            case SkillDamageTypeEnum.MELEE:
                return DamageTypeEnum.MELEE;
            case SkillDamageTypeEnum.RANGE:
                return DamageTypeEnum.RANGE;
            case SkillDamageTypeEnum.MAGIC:
                return DamageTypeEnum.MAGIC;
            case SkillDamageTypeEnum.FIRE:
                return DamageTypeEnum.FIRE;
            case SkillDamageTypeEnum.ICE:
                return DamageTypeEnum.ICE;
            case SkillDamageTypeEnum.ELEC:
                return DamageTypeEnum.ELEC;
            case SkillDamageTypeEnum.NORMAL:
            case SkillDamageTypeEnum.DARK:
            default:
                //TODO: the original leaves damage type "none" (no resistance/bonus applied) for
                // SKILL_ATTR_TYPE_NORMAL, and DARK has no DamageTypeEnum equivalent yet - both fall
                // back to MAGIC's pipeline rather than being dropped entirely.
                return DamageTypeEnum.MAGIC;
        }
    }

    private applyBuffPoint(
        skillProto: ActiveSkill,
        apply: SkillApplies,
        target: Player | Monster,
        context: SkillCalcContext,
    ): void {
        if (apply.kind !== SkillApplyKindEnum.POINT) return;

        const amount = apply.calculateAmount(context);
        const duration = apply.calculateDuration(context);
        const flag = skillProto.getAffectFlag();

        if (duration > 0 && flag !== undefined) {
            target.addAffect({ flag, point: apply.pointOn, value: amount, duration });
            return;
        }

        //TODO: a duration > 0 apply on a skill with no resolvable affects flag has no way to expire
        // generically yet; applied as an instant point change until a flag-less timed apply is needed.
        target.addPoint(apply.pointOn, amount);
    }

    private getSplashTargets(skillProto: ActiveSkill, primaryTarget: Player | Monster): Array<Player | Monster> {
        if (!skillProto.flags.has(SkillFlagsEnum.SPLASH) || skillProto.splashRange <= 0) {
            return [primaryTarget];
        }

        const targets: Array<Player | Monster> = [primaryTarget];

        for (const entity of primaryTarget.getNearbyEntities().values()) {
            if (targets.length >= skillProto.maxHit) break;
            if (!(entity.isPlayer() || entity.isMonster())) continue;
            if (entity.getEntityType() !== primaryTarget.getEntityType()) continue;

            const distance = MathUtil.calcDistance(
                entity.getPositionX(),
                entity.getPositionY(),
                primaryTarget.getPositionX(),
                primaryTarget.getPositionY(),
            );
            if (distance <= skillProto.splashRange) targets.push(entity);
        }

        return targets;
    }

    toDatabase() {
        return JSON.stringify(this.skills);
    }
}
