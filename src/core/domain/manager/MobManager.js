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
    #world;

    constructor({ config, world, animationManager }) {
        this.#config = config;
        this.#animationManager = animationManager;
        this.#world = world;
    }

    load() {
        this.#config.mobs.forEach((mob) => {
            this.#mobs.set(mob.vnum, mob);
        });
    }

    getMob(id, positionX, positionY) {
        const proto = this.#mobs.get(id);
        if (!proto) return;

        switch (proto.type) {
            case 'MONSTER':
                return new Monster(
                    {
                        id: proto.vnum,
                        virtualId: this.#world.generateVirtualId(),
                        entityType: EntityTypeEnum.MONSTER,
                        positionX,
                        positionY,
                        name: proto.name,
                        rank: proto.rank,
                        battleType: proto.battle_type,
                        level: proto.level,
                        size: proto.size,
                        aiFlag: proto.ai_flag,
                        mountCapacity: proto.mount_capacity,
                        raceFlag: proto.race_flag,
                        immuneFlag: proto.immune_flag,
                        empire: proto.empire,
                        folder: proto.folder,
                        onClick: proto.on_click,
                        st: proto.st,
                        dx: proto.dx,
                        ht: proto.ht,
                        iq: proto.iq,
                        damageMin: proto.damage_min,
                        damageMax: proto.damage_max,
                        maxHp: proto.max_hp,
                        regenCycle: proto.regen_cycle,
                        regenPercent: proto.regen_percent,
                        goldMin: proto.gold_min,
                        goldMax: proto.gold_max,
                        exp: proto.exp,
                        def: proto.def,
                        attackSpeed: proto.attack_speed,
                        movementSpeed: proto.move_speed,
                        aggressiveHpPct: proto.aggressive_hp_pct,
                        aggressiveSight: proto.aggressive_sight,
                        attackRange: proto.attack_range,
                        dropItem: proto.drop_item,
                        resurrectionId: proto.resurrection_vnum,
                        damMultiply: proto.dam_multiply,
                        summon: proto.summon,
                        drainSp: proto.drain_sp,
                        mobColor: proto.mob_color,
                        polymorphItem: proto.polymorph_item,
                        hpPercentToGetBerserk: proto.sp_berserk,
                        hpPercentToGetStoneSkin: proto.sp_stoneskin,
                        hpPercentToGetGodspeed: proto.sp_godspeed,
                        hpPercentToGetDeathblow: proto.sp_deathblow,
                        hpPercentToGetRevive: proto.sp_revive,
                    },
                    { animationManager: this.#animationManager },
                );
            case 'NPC':
                return new NPC(
                    {
                        id: proto.vnum,
                        virtualId: this.#world.generateVirtualId(),
                        entityType: EntityTypeEnum.MONSTER,
                        positionX,
                        positionY,
                        name: proto.name,
                        rank: proto.rank,
                        battleType: proto.battle_type,
                        level: proto.level,
                        size: proto.size,
                        aiFlag: proto.ai_flag,
                        mountCapacity: proto.mount_capacity,
                        raceFlag: proto.race_flag,
                        immuneFlag: proto.immune_flag,
                        empire: proto.empire,
                        folder: proto.folder,
                        onClick: proto.on_click,
                        st: proto.st,
                        dx: proto.dx,
                        ht: proto.ht,
                        iq: proto.iq,
                        damageMin: proto.damage_min,
                        damageMax: proto.damage_max,
                        maxHp: proto.max_hp,
                        regenCycle: proto.regen_cycle,
                        regenPercent: proto.regen_percent,
                        goldMin: proto.gold_min,
                        goldMax: proto.gold_max,
                        exp: proto.exp,
                        def: proto.def,
                        attackSpeed: proto.attack_speed,
                        movementSpeed: proto.move_speed,
                        aggressiveHpPct: proto.aggressive_hp_pct,
                        aggressiveSight: proto.aggressive_sight,
                        attackRange: proto.attack_range,
                        dropItem: proto.drop_item,
                        resurrectionId: proto.resurrection_vnum,
                        damMultiply: proto.dam_multiply,
                        summon: proto.summon,
                        drainSp: proto.drain_sp,
                        mobColor: proto.mob_color,
                        polymorphItem: proto.polymorph_item,
                        hpPercentToGetBerserk: proto.sp_berserk,
                        hpPercentToGetStoneSkin: proto.sp_stoneskin,
                        hpPercentToGetGodspeed: proto.sp_godspeed,
                        hpPercentToGetDeathblow: proto.sp_deathblow,
                        hpPercentToGetRevive: proto.sp_revive,
                    },
                    { animationManager: this.#animationManager },
                );
        }
    }
}
