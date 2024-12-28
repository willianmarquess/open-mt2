import { Config, makeConfig } from '@/core/infra/config/Config';
import atlas from '../../../core/infra/config/data/atlasinfo.json';
import mobs from '../../../core/infra/config/data/mobs.json';
import items from '../../../core/infra/config/data/items.json';
import groups from '../../../core/infra/config/data/spawn/group.json';
import groupsCollection from '../../../core/infra/config/data/spawn/group_group.json';
import animations from '../../../core/infra/config/data/animation/animations.json';
import commonDrops from '../../../core/infra/config/data/drop/common_drops.json';
import dropDeltaBoss from '../../../core/infra/config/data/drop/dropDeltaBoss';
import dropDeltaLevel from '../../../core/infra/config/data/drop/dropDeltaLevel';
import expDeltaLevel from '../../../core/infra/config/data/exp/expDeltaLevel';
import dropGoldByRank from '../../../core/infra/config/data/drop/dropGoldByRank';
import general from '../../../core/infra/config/data/general.json';

type Atlas = {
    mapName: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    aka?: string;
    goto?: {
        red?: Array<number>;
        yellow?: Array<number>;
        blue?: Array<number>;
        default?: Array<number>;
    };
};

export type MobsProto = {
    vnum: string;
    name: string;
    rank: string;
    type: string;
    battle_type: string;
    level: string;
    size?: string;
    ai_flag?: string;
    mount_capacity: string;
    race_flag: string;
    immune_flag?: string;
    empire: string;
    folder: string;
    on_click: string;
    st: string;
    dx: string;
    ht: string;
    iq: string;
    damage_min: string;
    damage_max: string;
    max_hp: string;
    regen_cycle: string;
    regen_percent: string;
    gold_min: string;
    gold_max: string;
    exp: string;
    def: string;
    attack_speed: string;
    move_speed: string;
    aggressive_hp_pct: string;
    aggressive_sight: string;
    attack_range: string;
    drop_item: string;
    resurrection_vnum: string;
    enchant_curse: string;
    enchant_slow: string;
    enchant_poison: string;
    enchant_stun: string;
    enchant_critical: string;
    enchant_penetrate: string;
    resist_sword: string;
    resist_twohand: string;
    resist_dagger: string;
    resist_bell: string;
    resist_fan: string;
    resist_bow: string;
    resist_fire: string;
    resist_elect: string;
    resist_magic: string;
    resist_wind: string;
    resist_poison: string;
    dam_multiply: string;
    summon: string;
    drain_sp: string;
    mob_color: string;
    polymorph_item: string;
    skill_level0: string;
    skill_vnum0: string;
    skill_level1: string;
    skill_vnum1: string;
    skill_level2?: string;
    skill_vnum2?: string;
    skill_level3?: string;
    skill_vnum3?: string;
    skill_level4?: string;
    skill_vnum4?: string;
    sp_berserk: string;
    sp_stoneskin: string;
    sp_godspeed: string;
    sp_deathblow: string;
    sp_revive: string;
};

export type Groups = {
    mobs: Array<{
        vnum: string;
    }>;
    leaderVnum: string;
    vnum: string;
};

export type GroupCollection = {
    mobs: Array<{
        vnum: string;
        count?: string;
    }>;
    vnum: string;
};

export type ItemProto = {
    vnum: string;
    name: string;
    item_type: string;
    sub_type: string;
    size: string;
    anti_flag: string;
    flag: string;
    item_wear: string;
    immune: string;
    gold: string;
    shop_buy_price: string;
    refine: string;
    refineset: string;
    magic_pct: string;
    limit_type0: string;
    limit_value0: string;
    limit_type1: string;
    limit_value1: string;
    addon_type0: string;
    addon_value0: string;
    addon_type1: string;
    addon_value1: string;
    addon_type2: string;
    addon_value2: string;
    value0: string;
    value1: string;
    value2: string;
    value3: string;
    value4: string;
    value5: string;
    specular: string;
    socket: string;
    attu_addon: string;
};

type Animation = {
    MotionDuration: number;
    key: string;
    Accumulation?: Array<{
        accX: number;
        accY: number;
        accZ: number;
    }>;
};

export type CommonDrop = {
    minLevel?: number;
    maxLevel?: number;
    percentage?: number;
    vnum?: number;
};

type CommonDrops = {
    PAWN: Array<CommonDrop>;
    S_PAWN: Array<CommonDrop>;
    KNIGHT: Array<CommonDrop>;
    S_KNIGHT: Array<CommonDrop>;
    BOSS: Array<CommonDrop>;
    KING: Array<CommonDrop>;
};

type DropGoldByRank = {
    [key: string]: number;
};

export type GameConfig = Config & {
    SERVER_PORT: string;
    SERVER_ADDRESS: string;
    REAL_SERVER_ADDRESS: string;
    DB_DATABASE_NAME: string;
    atlas: Array<Atlas>;
    mobs: Array<MobsProto>;
    groups: Array<Groups>;
    groupsCollection: Array<GroupCollection>;
    items: Array<ItemProto>;
    animations: Array<Animation>;
    commonDrops: CommonDrops;
    dropDeltaBoss: Array<number>;
    dropDeltaLevel: Array<number>;
    expDeltaLevel: Array<number>;
    dropGoldByRank: DropGoldByRank;
    MAX_LEVEL: number;
    POINTS_PER_LEVEL: number;
    MAX_POINTS: number;
    INVENTORY_PAGES: number;
    PERCENT_TO_MULT_GOLD_BY_50: number;
    PERCENT_TO_MULT_GOLD_BY_10: number;
    PERCENT_TO_MULT_GOLD_BY_5: number;
};

const gameConfig: GameConfig = {
    ...makeConfig(),
    SERVER_PORT: process.env.GAME_SERVER_PORT,
    SERVER_ADDRESS: process.env.GAME_SERVER_ADDRESS,
    REAL_SERVER_ADDRESS: process.env.REAL_SERVER_ADDRESS,
    DB_DATABASE_NAME: process.env.GAME_DB_DATABASE_NAME,
    atlas,
    mobs,
    groups,
    groupsCollection,
    items: items as Array<ItemProto>,
    animations: animations as Array<Animation>,
    commonDrops,
    dropDeltaBoss,
    dropDeltaLevel,
    dropGoldByRank,
    expDeltaLevel,
    ...general,
};

export const makeGameConfig = () => gameConfig;
