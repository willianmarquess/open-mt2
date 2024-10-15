// const ImmuneFlagsEnum = {
//     STUN: 1 << 0,
//     SLOW: 1 << 1,
//     FALL: 1 << 2,
//     CURSE: 1 << 3,
//     POISON: 1 << 4,
//     TERROR: 1 << 5,
//     REFLECT: 1 << 6,
// };

import EntityTypeEnum from '../../enum/EntityTypeEnum.js';
import Monster from '../entities/game/mob/Monster.js';
import NPC from '../entities/game/mob/NPC.js';

// const MobRankEnum = {
//     PAWN: 0,
//     S_PAWN: 1,
//     KNIGHT: 2,
//     S_KNIGHT: 3,
//     BOSS: 4,
//     KING: 5,
// };

// const MobAiFlagEnum = {
//     AGGRESSIVE: 1 << 0,
//     NOMOVE: 1 << 1,
//     COWARD: 1 << 2,
//     NOATTACKSHINSU: 1 << 3,
//     NOATTACKJINNO: 1 << 4,
//     NOATTACKCHUNJO: 1 << 5,
//     ATTACKMOB: 1 << 6,
//     BERSERK: 1 << 7,
//     STONESKIN: 1 << 8,
//     GODSPEED: 1 << 9,
//     DEATHBLOW: 1 << 10,
//     REVIVE: 1 << 11,
// };

// const MobEnchantsEnum = {
//     CURSE: 0,
//     SLOW: 1,
//     POISON: 2,
//     STUN: 3,
//     CRITICAL: 4,
//     PENETRATE: 5,
// };

// const MobResistsEnum = {
//     SWORD: 0,
//     TWOHAND: 1,
//     DAGGER: 2,
//     BELL: 3,
//     FAN: 4,
//     BOW: 5,
//     FIRE: 6,
//     ELECT: 7,
//     MAGIC: 8,
//     WIND: 9,
//     POISON: 10,
// };

// const MobBattleTypeEnum = {
//     POWER: 0,
//     TANKER: 1,
//     SUPER_POWER: 2,
//     SUPER_TANKER: 3,
//     RANGE: 4,
//     MAGIC: 5,
// };

// const RaceFlagsEnum = {
//     ANIMAL: 1 << 0,
//     UNDEAD: 1 << 1,
//     DEVIL: 1 << 2,
//     HUMAN: 1 << 3,
//     ORC: 1 << 4,
//     MILGYO: 1 << 5,
//     INSECT: 1 << 6,
//     FIRE: 1 << 7,
//     ICE: 1 << 8,
//     DESERT: 1 << 9,
//     TREE: 1 << 10,
//     ATT_ELEC: 1 << 11,
//     ATT_FIRE: 1 << 12,
//     ATT_ICE: 1 << 13,
//     ATT_WIND: 1 << 14,
//     ATT_EARTH: 1 << 15,
//     ATT_DARK: 1 << 16,
// };

export default class MobManager {
    #config;
    #mobs = new Map();
    #animationManager;

    constructor({ config, animationManager }) {
        this.#config = config;
        this.#animationManager = animationManager;
    }

    load() {
        this.#config.mobs.forEach((mob) => {
            this.#mobs.set(mob.vnum, mob);
        });
    }

    hasMob(id) {
        return this.#mobs.has(id);
    }

    getMob(id, positionX, positionY, direction = 0) {
        const proto = this.#mobs.get(id);
        if (!proto) return;

        switch (proto.type) {
            case 'MONSTER': {
                return new Monster(
                    {
                        id: Number(proto.vnum),
                        entityType: EntityTypeEnum.MONSTER,
                        positionX: Number(positionX),
                        positionY: Number(positionY),
                        name: proto.name,
                        rank: proto.rank,
                        battleType: proto.battle_type,
                        level: Number(proto.level),
                        size: Number(proto.size),
                        aiFlag: proto.ai_flag,
                        mountCapacity: Number(proto.mount_capacity),
                        raceFlag: proto.race_flag,
                        immuneFlag: proto.immune_flag,
                        empire: Number(proto.empire),
                        folder: proto.folder,
                        onClick: Number(proto.on_click),
                        st: Number(proto.st),
                        dx: Number(proto.dx),
                        ht: Number(proto.ht),
                        iq: Number(proto.iq),
                        damageMin: Number(proto.damage_min),
                        damageMax: Number(proto.damage_max),
                        maxHp: Number(proto.max_hp),
                        regenCycle: Number(proto.regen_cycle),
                        regenPercent: Number(proto.regen_percent),
                        goldMin: Number(proto.gold_min),
                        goldMax: Number(proto.gold_max),
                        exp: Number(proto.exp),
                        def: Number(proto.def),
                        attackSpeed: Number(proto.attack_speed),
                        movementSpeed: Number(proto.move_speed),
                        aggressiveHpPct: Number(proto.aggressive_hp_pct),
                        aggressiveSight: Number(proto.aggressive_sight),
                        attackRange: Number(proto.attack_range),
                        dropItem: Number(proto.drop_item),
                        resurrectionId: Number(proto.resurrection_vnum),
                        damMultiply: Number(proto.dam_multiply),
                        summon: Number(proto.summon),
                        drainSp: Number(proto.drain_sp),
                        mobColor: Number(proto.mob_color),
                        polymorphItem: Number(proto.polymorph_item),
                        hpPercentToGetBerserk: Number(proto.sp_berserk),
                        hpPercentToGetStoneSkin: Number(proto.sp_stoneskin),
                        hpPercentToGetGodspeed: Number(proto.sp_godspeed),
                        hpPercentToGetDeathblow: Number(proto.sp_deathblow),
                        hpPercentToGetRevive: Number(proto.sp_revive),
                        direction,
                    },
                    { animationManager: this.#animationManager },
                );
            }
            case 'NPC': {
                return new NPC(
                    {
                        id: Number(proto.vnum),
                        entityType: EntityTypeEnum.MONSTER,
                        positionX: Number(positionX),
                        positionY: Number(positionY),
                        name: proto.name,
                        rank: proto.rank,
                        battleType: proto.battle_type,
                        level: Number(proto.level),
                        size: Number(proto.size),
                        aiFlag: proto.ai_flag,
                        mountCapacity: Number(proto.mount_capacity),
                        raceFlag: proto.race_flag,
                        immuneFlag: proto.immune_flag,
                        empire: Number(proto.empire),
                        folder: proto.folder,
                        onClick: Number(proto.on_click),
                        st: Number(proto.st),
                        dx: Number(proto.dx),
                        ht: Number(proto.ht),
                        iq: Number(proto.iq),
                        damageMin: Number(proto.damage_min),
                        damageMax: Number(proto.damage_max),
                        maxHp: Number(proto.max_hp),
                        regenCycle: Number(proto.regen_cycle),
                        regenPercent: Number(proto.regen_percent),
                        goldMin: Number(proto.gold_min),
                        goldMax: Number(proto.gold_max),
                        exp: Number(proto.exp),
                        def: Number(proto.def),
                        attackSpeed: Number(proto.attack_speed),
                        movementSpeed: Number(proto.move_speed),
                        aggressiveHpPct: Number(proto.aggressive_hp_pct),
                        aggressiveSight: Number(proto.aggressive_sight),
                        attackRange: Number(proto.attack_range),
                        dropItem: Number(proto.drop_item),
                        resurrectionId: Number(proto.resurrection_vnum),
                        damMultiply: Number(proto.dam_multiply),
                        summon: Number(proto.summon),
                        drainSp: Number(proto.drain_sp),
                        mobColor: Number(proto.mob_color),
                        polymorphItem: Number(proto.polymorph_item),
                        hpPercentToGetBerserk: Number(proto.sp_berserk),
                        hpPercentToGetStoneSkin: Number(proto.sp_stoneskin),
                        hpPercentToGetGodspeed: Number(proto.sp_godspeed),
                        hpPercentToGetDeathblow: Number(proto.sp_deathblow),
                        hpPercentToGetRevive: Number(proto.sp_revive),
                        direction,
                    },
                    { animationManager: this.#animationManager },
                );
            }
        }
    }
}
