import Logger from '@/core/infra/logger/Logger';
import Player from '../Player';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import Item from '../../item/Item';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class PlayerApplies {
    private readonly applies: Map<ApplyTypeEnum, (value: any) => void> = new Map();
    private readonly player: Player;
    private readonly logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
        this.init();
    }

    private init() {
        this.applies.set(ApplyTypeEnum.STR, (value: number) => this.player.addPoint(PointsEnum.ST, value));
        this.applies.set(ApplyTypeEnum.DEX, (value: number) => this.player.addPoint(PointsEnum.DX, value));
        this.applies.set(ApplyTypeEnum.CON, (value: number) => this.player.addPoint(PointsEnum.HT, value));
        this.applies.set(ApplyTypeEnum.INT, (value: number) => this.player.addPoint(PointsEnum.IQ, value));
        this.applies.set(ApplyTypeEnum.MAX_HP, (value: number) => this.player.addPoint(PointsEnum.MAX_HEALTH, value));
        this.applies.set(ApplyTypeEnum.MAX_SP, (value: number) => this.player.addPoint(PointsEnum.MAX_MANA, value));
        this.applies.set(ApplyTypeEnum.MAX_HP_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.MAX_HP_PCT, value),
        );
        this.applies.set(ApplyTypeEnum.MAX_SP_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.MAX_SP_PCT, value),
        );
        this.applies.set(ApplyTypeEnum.ATT_SPEED, (value: number) =>
            this.player.addPoint(PointsEnum.ATTACK_SPEED, value),
        );
        this.applies.set(ApplyTypeEnum.MOV_SPEED, (value: number) =>
            this.player.addPoint(PointsEnum.MOVE_SPEED, value),
        );
        this.applies.set(ApplyTypeEnum.CAST_SPEED, (value: number) =>
            this.player.addPoint(PointsEnum.CASTING_SPEED, value),
        );
        this.applies.set(ApplyTypeEnum.HP_REGEN, (value: number) => this.player.addPoint(PointsEnum.HP_REGEN, value));
        this.applies.set(ApplyTypeEnum.SP_REGEN, (value: number) => this.player.addPoint(PointsEnum.MANA_REGEN, value));
        this.applies.set(ApplyTypeEnum.POISON_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.POISON_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.STUN_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.STUN_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.SLOW_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.SLOW_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.CRITICAL_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.CRITICAL_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.PENETRATE_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.PENETRATE_CHANCE, value),
        );
        this.applies.set(ApplyTypeEnum.BLOCK, (value: number) => this.player.addPoint(PointsEnum.BLOCK, value));
        this.applies.set(ApplyTypeEnum.DODGE, (value: number) => this.player.addPoint(PointsEnum.DODGE, value));
        this.applies.set(ApplyTypeEnum.RESIST_SWORD, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_SWORD, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_TWOHAND, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_TWOHAND, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_DAGGER, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_DAGGER, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_BELL, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_BELL, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_FAN, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_FAN, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_BOW, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_BOW, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_FIRE, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_FIRE, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_ELEC, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_ELEC, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_MAGIC, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_MAGIC, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_WIND, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_WIND, value),
        );
        this.applies.set(ApplyTypeEnum.REFLECT_MELEE, (value: number) =>
            this.player.addPoint(PointsEnum.REFLECT_MELEE, value),
        );
        this.applies.set(ApplyTypeEnum.REFLECT_CURSE, (value: number) =>
            this.player.addPoint(PointsEnum.REFLECT_CURSE, value),
        );
        this.applies.set(ApplyTypeEnum.ATT_GRADE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.ATT_GRADE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.DEF_GRADE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.DEF_GRADE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MAGIC_ATT_GRADE, (value: number) =>
            this.player.addPoint(PointsEnum.MAGIC_ATT_GRADE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MAGIC_DEF_GRADE, (value: number) =>
            this.player.addPoint(PointsEnum.MAGIC_DEF_GRADE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_HUMAN, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_HUMAN, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_ANIMAL, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_ANIMAL, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_ORC, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_ORC, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_MILGYO, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_MILGYO, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_UNDEAD, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_UNDEAD, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_DEVIL, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_DEVIL, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_WARRIOR, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_WARRIOR, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_ASSASSIN, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_ASSASSIN, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_SURA, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_SURA, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_SHAMAN, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_SHAMAN, value),
        );
        this.applies.set(ApplyTypeEnum.ATTBONUS_MONSTER, (value: number) =>
            this.player.addPoint(PointsEnum.ATTBONUS_MONSTER, value),
        );
        this.applies.set(ApplyTypeEnum.STEAL_HP, (value: number) =>
            this.player.addPoint(PointsEnum.STEAL_HEALTH, value),
        );
        this.applies.set(ApplyTypeEnum.STEAL_SP, (value: number) => this.player.addPoint(PointsEnum.STEAL_MANA, value));
        this.applies.set(ApplyTypeEnum.MANA_BURN_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.MANA_BURN_PCT, value),
        );
        this.applies.set(ApplyTypeEnum.DAMAGE_SP_RECOVER, (value: number) =>
            this.player.addPoint(PointsEnum.DAMAGE_SP_RECOVER, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_ICE, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_ICE, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_EARTH, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_EARTH, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_DARK, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_DARK, value),
        );
        this.applies.set(ApplyTypeEnum.ANTI_CRITICAL_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_CRITICAL, value),
        );
        this.applies.set(ApplyTypeEnum.ANTI_PENETRATE_PCT, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_PENETRATE, value),
        );
        this.applies.set(ApplyTypeEnum.POISON_REDUCE, (value: number) =>
            this.player.addPoint(PointsEnum.POISON_REDUCE, value),
        );
        this.applies.set(ApplyTypeEnum.KILL_SP_RECOVER, (value: number) =>
            this.player.addPoint(PointsEnum.KILL_SP_RECOVER, value),
        );
        this.applies.set(ApplyTypeEnum.EXP_DOUBLE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.EXP_DOUBLE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.GOLD_DOUBLE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.GOLD_DOUBLE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.ITEM_DROP_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.ITEM_DROP_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.POTION_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.POTION_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.KILL_HP_RECOVER, (value: number) =>
            this.player.addPoint(PointsEnum.KILL_HP_RECOVERY, value),
        );
        this.applies.set(ApplyTypeEnum.IMMUNE_STUN, (value: number) =>
            this.player.addPoint(PointsEnum.IMMUNE_STUN, value),
        );
        this.applies.set(ApplyTypeEnum.IMMUNE_SLOW, (value: number) =>
            this.player.addPoint(PointsEnum.IMMUNE_SLOW, value),
        );
        this.applies.set(ApplyTypeEnum.IMMUNE_FALL, (value: number) =>
            this.player.addPoint(PointsEnum.IMMUNE_FALL, value),
        );
        this.applies.set(ApplyTypeEnum.BOW_DISTANCE, (value: number) =>
            this.player.addPoint(PointsEnum.BOW_DISTANCE, value),
        );
        this.applies.set(ApplyTypeEnum.CURSE_PCT, (value: number) => this.player.addPoint(PointsEnum.CURSE, value));
        this.applies.set(ApplyTypeEnum.MAX_STAMINA, (value: number) =>
            this.player.addPoint(PointsEnum.MAX_STAMINA, value),
        );
        this.applies.set(ApplyTypeEnum.MALL_ATTBONUS, (value: number) =>
            this.player.addPoint(PointsEnum.ATTACK_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MALL_DEFBONUS, (value: number) =>
            this.player.addPoint(PointsEnum.MALL_DEFBONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MALL_EXPBONUS, (value: number) =>
            this.player.addPoint(PointsEnum.MALL_EXPBONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MALL_ITEMBONUS, (value: number) =>
            this.player.addPoint(PointsEnum.MALL_ITEM_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MALL_GOLDBONUS, (value: number) =>
            this.player.addPoint(PointsEnum.MALL_GOLDBONUS, value),
        );
        this.applies.set(ApplyTypeEnum.SKILL_DAMAGE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.SKILL_DAMAGE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.NORMAL_HIT_DAMAGE_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.NORMAL_HIT_DAMAGE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.SKILL_DEFEND_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.SKILL_DEFEND_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.NORMAL_HIT_DEFEND_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.NORMAL_HIT_DEFEND_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.PC_BANG_EXP_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.PC_BANG_EXP_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.PC_BANG_DROP_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.PC_BANG_DROP_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_WARRIOR, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_WARRIOR, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_ASSASSIN, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_ASSASSIN, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_SURA, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_SURA, value),
        );
        this.applies.set(ApplyTypeEnum.RESIST_SHAMAN, (value: number) =>
            this.player.addPoint(PointsEnum.RESIST_SHAMAN, value),
        );
        this.applies.set(ApplyTypeEnum.ENERGY, (value: number) => this.player.addPoint(PointsEnum.ENERGY, value));
        this.applies.set(ApplyTypeEnum.DEF_GRADE, (value: number) =>
            this.player.addPoint(PointsEnum.DEF_GRADE_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.COSTUME_ATTR_BONUS, (value: number) =>
            this.player.addPoint(PointsEnum.COSTUME_ATTR_BONUS, value),
        );
        this.applies.set(ApplyTypeEnum.MAGIC_ATTBONUS_PER, (value: number) =>
            this.player.addPoint(PointsEnum.MAGIC_ATT_BONUS_PER, value),
        );
        this.applies.set(ApplyTypeEnum.MELEE_MAGIC_ATTBONUS_PER, (value: number) =>
            this.player.addPoint(PointsEnum.MELEE_MAGIC_ATT_BONUS_PER, value),
        );
    }

    addApply(type: ApplyTypeEnum, value: number) {
        const applyFunc = this.applies.get(type);

        if (applyFunc && typeof applyFunc === 'function') {
            applyFunc(Number(value));
        } else {
            this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
        }
    }

    addItemApplies(item: Item) {
        for (const { type, value } of item.getApplies()) {
            if (type === ApplyTypeEnum.NONE) continue;
            const applyFunc = this.applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(Number(value));
            } else {
                this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }

    removeItemApplies(item: Item) {
        for (const { type, value } of item.getApplies()) {
            if (type === ApplyTypeEnum.NONE) continue;
            const applyFunc = this.applies.get(type);

            if (applyFunc && typeof applyFunc === 'function') {
                applyFunc(-Number(value));
            } else {
                this.logger.debug(`[PLAYER] Apply not implemented yet: ${type}`);
            }
        }
    }
}
