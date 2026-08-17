import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { DamageTypeEnum } from '@/core/enum/DamageTypeEnum';
import { SkillStatusEffectEnum } from '@/core/enum/SkillStatusEffectEnum';
import Player from '../../Player';
import PlayerBattleAgainstMobStrategy from './PlayerBattleAgainstMobStrategy';
import Monster from '../../../mob/Monster';
import Stone from '../../../mob/Stone';
import Logger from '@/core/infra/logger/Logger';

//TODO: add pretty singleton, instead of this;

export class PlayerBattle {
    private readonly player: Player;
    private readonly playerBattleAgainstMob: PlayerBattleAgainstMobStrategy;

    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
        this.playerBattleAgainstMob = new PlayerBattleAgainstMobStrategy(player, logger);
    }

    attack(attackType: AttackTypeEnum, victim: Monster | Player | Stone) {
        if (victim instanceof Monster || victim instanceof Stone) {
            return this.playerBattleAgainstMob.execute(attackType, victim);
        }

        if (victim instanceof Player) {
            //TODO: pvp
            this.logger.info(`[PlayerBattle] Player against Player not exist yet`);
        }
    }

    /** Entry point for skill damage (PlayerSkill.computeSkill), reusing the same damage pipeline as normal attacks. */
    applySkillDamage(
        damage: number,
        damageType: DamageTypeEnum,
        victim: Monster | Player,
        ignoreDefense: boolean = false,
    ) {
        if (victim instanceof Monster || victim instanceof Stone) {
            return this.playerBattleAgainstMob.applyDamage(damage, damageType, victim, ignoreDefense);
        }

        //TODO: pvp
        this.logger.info(`[PlayerBattle] Skill damage against Player not implemented yet`);
    }

    /** The "atk" a USE_MELEE_DAMAGE skill's formula should use against this victim (see PlayerBattleAgainstMobStrategy.calculateMeleeAttack). */
    calculateMeleeAttack(victim: Monster | Player, ignoreTargetRating: boolean): number {
        if (victim instanceof Monster) {
            return this.playerBattleAgainstMob.calculateMeleeAttack(victim, ignoreTargetRating);
        }

        //TODO: pvp
        return 0;
    }

    /** The "atk" a USE_ARROW_DAMAGE skill's formula should use against this victim (see PlayerBattleAgainstMobStrategy.calculateArrowAttack). */
    calculateArrowAttack(victim: Monster | Player): number {
        if (victim instanceof Monster) {
            return this.playerBattleAgainstMob.calculateArrowAttack(victim);
        }

        //TODO: pvp
        return 0;
    }

    /**
     * Entry point for skill-triggered status effects (STUN/SLOW/POISON/FIRE from a STATUS apply),
     * reusing the same on-hit effect logic as equipment procs. `amount` only applies to FIRE, as the
     * skill's own damage-per-tick (STUN/SLOW have no amount, POISON keeps its fixed internal one).
     */
    applySkillStatusEffect(
        effect: SkillStatusEffectEnum,
        victim: Monster | Player,
        durationSeconds?: number,
        amount?: number,
    ) {
        if (!(victim instanceof Monster)) {
            //TODO: pvp
            this.logger.info(`[PlayerBattle] Skill status effect against Player not implemented yet`);
            return;
        }

        const durationMs = durationSeconds !== undefined ? durationSeconds * 1000 : undefined;

        switch (effect) {
            case SkillStatusEffectEnum.STUN:
                this.playerBattleAgainstMob.applyStun(victim, durationMs);
                return;
            case SkillStatusEffectEnum.SLOW:
                this.playerBattleAgainstMob.applySlow(victim, durationMs);
                return;
            case SkillStatusEffectEnum.POISON:
                this.playerBattleAgainstMob.applyPoison(victim);
                return;
            case SkillStatusEffectEnum.FIRE:
                this.playerBattleAgainstMob.applyFire(victim, amount, durationMs);
                return;
        }
    }
}
