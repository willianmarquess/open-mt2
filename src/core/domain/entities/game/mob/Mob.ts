import { MobRankEnum } from '@/core/enum/MobRankEnum';
import Character from '../Character';
import type MonsterGroup from './MonsterGroup';
import { BattleTypeEnum } from '@/core/enum/BattleTypeEnum';
import BitFlag from '@/core/util/BitFlag';
import { MobAIFlagEnum } from '@/core/enum/MobAIFlagEnum';
import { MobRaceFlagEnum } from '@/core/enum/MobRaceFlagEnum';
import { MobImmuneFlagEnum } from '@/core/enum/MobImmuneFlagEnum';
import { MobsProto } from '@/game/infra/config/GameConfig';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { MobEnchantEnum } from '@/core/enum/MobEnchantEnum';
import { MobResistEnum } from '@/core/enum/MobResistEnum';
import { MobPoints } from './delegate/MobPoints';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';

enum MobSizeEnum {
    RESERVED = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

class MobResist {
    public readonly type: MobResistEnum;
    public readonly value: number;

    constructor({ type, value }: { type: MobResistEnum; value: number }) {
        this.type = type;
        this.value = value;
    }
}

class MobEnchant {
    public readonly type: MobEnchantEnum;
    public readonly value: number;

    constructor({ type, value }: { type: MobEnchantEnum; value: number }) {
        this.type = type;
        this.value = value;
    }
}

class MobSkill {
    public readonly id: number;
    public readonly level: number;

    constructor({ id, level }: { id: number; level: number }) {
        this.id = id;
        this.level = level;
    }
}

export type MobParams = {
    proto: MobsProto;
    positionX: number;
    positionY: number;
    entityType: EntityTypeEnum;
    virtualId?: number;
    direction: number;
};

const rankMapper: { [key: string]: MobRankEnum } = {
    PAWN: MobRankEnum.PAWN,
    S_PAWN: MobRankEnum.S_PAWN,
    KNIGHT: MobRankEnum.KNIGHT,
    S_KNIGHT: MobRankEnum.S_KNIGHT,
    BOSS: MobRankEnum.BOSS,
    KING: MobRankEnum.KING,
};

const battleTypeMapper: { [key: string]: BattleTypeEnum } = {
    MELEE: BattleTypeEnum.MELEE,
    RANGE: BattleTypeEnum.RANGE,
    MAGIC: BattleTypeEnum.MAGIC,
    SPECIAL: BattleTypeEnum.SPECIAL,
    POWER: BattleTypeEnum.POWER,
    TANKER: BattleTypeEnum.TANKER,
    SUPER_POWER: BattleTypeEnum.SUPER_POWER,
    SUPER_TANKER: BattleTypeEnum.SUPER_TANKER,
};

const aiFlagMapper: { [key: string]: MobAIFlagEnum } = {
    AGGR: MobAIFlagEnum.AGGR,
    NOMOVE: MobAIFlagEnum.NOMOVE,
    COWARD: MobAIFlagEnum.COWARD,
    NOATTACKSHINSU: MobAIFlagEnum.NOATTACKSHINSU,
    NOATTACKJINNO: MobAIFlagEnum.NOATTACKJINNO,
    NOATTACKCHUNJO: MobAIFlagEnum.NOATTACKCHUNJO,
    ATTACKMOB: MobAIFlagEnum.ATTACKMOB,
    BERSERK: MobAIFlagEnum.BERSERK,
    STONESKIN: MobAIFlagEnum.STONESKIN,
    GODSPEED: MobAIFlagEnum.GODSPEED,
    DEATHBLOW: MobAIFlagEnum.DEATHBLOW,
    REVIVE: MobAIFlagEnum.REVIVE,
    DEFAULT: MobAIFlagEnum.DEFAULT,
};

const raceFlagMapper: { [key: string]: MobRaceFlagEnum } = {
    ANIMAL: MobRaceFlagEnum.ANIMAL,
    UNDEAD: MobRaceFlagEnum.UNDEAD,
    DEVIL: MobRaceFlagEnum.DEVIL,
    HUMAN: MobRaceFlagEnum.HUMAN,
    ORC: MobRaceFlagEnum.ORC,
    MILGYO: MobRaceFlagEnum.MILGYO,
    INSECT: MobRaceFlagEnum.INSECT,
    FIRE: MobRaceFlagEnum.FIRE,
    ICE: MobRaceFlagEnum.ICE,
    DESERT: MobRaceFlagEnum.DESERT,
    TREE: MobRaceFlagEnum.TREE,
    ATT_ELEC: MobRaceFlagEnum.ATT_ELEC,
    ATT_FIRE: MobRaceFlagEnum.ATT_FIRE,
    ATT_ICE: MobRaceFlagEnum.ATT_ICE,
    ATT_WIND: MobRaceFlagEnum.ATT_WIND,
    ATT_EARTH: MobRaceFlagEnum.ATT_EARTH,
    ATT_DARK: MobRaceFlagEnum.ATT_DARK,
    DEFAULT: MobRaceFlagEnum.DEFAULT,
};

const immuneFlagMapper: { [key: string]: MobImmuneFlagEnum } = {
    STUN: MobImmuneFlagEnum.STUN,
    SLOW: MobImmuneFlagEnum.SLOW,
    FALL: MobImmuneFlagEnum.FALL,
    CURSE: MobImmuneFlagEnum.CURSE,
    POISON: MobImmuneFlagEnum.POISON,
    TERROR: MobImmuneFlagEnum.TERROR,
    REFLECT: MobImmuneFlagEnum.REFLECT,
};

export abstract class Mob extends Character {
    protected readonly rank: MobRankEnum;
    protected readonly battleType: BattleTypeEnum;
    protected readonly size: MobSizeEnum = MobSizeEnum.MEDIUM;
    protected readonly aiFlag: BitFlag = new BitFlag();
    protected readonly mountCapacity: number;
    protected readonly raceFlag: BitFlag = new BitFlag();
    protected readonly immuneFlag: BitFlag = new BitFlag();
    protected readonly folder: string;
    protected readonly onClick: number;
    protected readonly damageMin: number;
    protected readonly damageMax: number;
    protected readonly regenCycle: number;
    protected readonly regenPercent: number;
    protected readonly goldMin: number;
    protected readonly goldMax: number;
    protected readonly exp: number;
    protected readonly def: number;
    protected readonly aggressiveHpPct: number;
    protected readonly aggressiveSight: number;
    protected readonly attackRange: number;
    protected readonly dropItem: number;
    protected readonly resurrectionId: number;
    protected readonly direction: number;

    protected readonly resists: Array<MobResist> = [];
    protected readonly enchants: Array<MobEnchant> = [];
    protected readonly skills: Array<MobSkill> = [];

    protected readonly damMultiply: number;
    protected readonly summon: number;
    protected readonly drainSp: number;
    protected readonly mobColor: number;
    protected readonly polymorphItem: number;

    protected readonly hpPercentToGetBerserk: number;
    protected readonly hpPercentToGetStoneSkin: number;
    protected readonly hpPercentToGetGodspeed: number;
    protected readonly percentToGetDeathblow: number;
    protected readonly hpPercentToGetRevive: number;

    protected group: MonsterGroup | null = null;
    protected readonly points: MobPoints;

    constructor(
        params: MobParams,
        {
            animationManager,
            questManager,
            eventTimerManager,
        }: {
            animationManager: AnimationManager;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
        },
    ) {
        super(
            {
                id: Number(params.proto.vnum),
                classId: Number(params.proto.vnum),
                virtualId: Number(params.virtualId),
                entityType: Number(params.entityType),
                positionX: Number(params.positionX),
                positionY: Number(params.positionY),
                name: params.proto.name,
                empire: Number(params.proto.empire),
            },
            {
                animationManager,
                questManager,
                eventTimerManager,
            },
        );
        const proto = params.proto;

        this.rank = rankMapper[String(proto.rank)] ?? MobRankEnum.KNIGHT;
        this.battleType = battleTypeMapper[String(proto.battle_type)] ?? BattleTypeEnum.MELEE;

        this.applyFlags(proto.ai_flag, aiFlagMapper, this.aiFlag);
        this.applyFlags(proto.race_flag, raceFlagMapper, this.raceFlag);
        this.applyFlags(proto.immune_flag, immuneFlagMapper, this.immuneFlag);
        this.loadEnchants(proto);
        this.loadResists(proto);
        this.loadSkills(proto);

        this.size = Number(proto.size);
        this.mountCapacity = Number(proto.mount_capacity);
        this.folder = proto.folder;
        this.onClick = Number(proto.on_click);
        this.damageMin = Number(proto.damage_min);
        this.damageMax = Number(proto.damage_max);
        this.regenCycle = Number(proto.regen_cycle);
        this.regenPercent = Number(proto.regen_percent);
        this.goldMin = Number(proto.gold_min);
        this.goldMax = Number(proto.gold_max);
        this.exp = Number(proto.exp);
        this.def = Number(proto.def);
        this.aggressiveHpPct = Number(proto.aggressive_hp_pct);
        this.aggressiveSight = Number(proto.aggressive_sight);
        this.attackRange = Number(proto.attack_range);
        this.dropItem = Number(proto.drop_item);
        this.resurrectionId = Number(proto.resurrection_vnum);
        this.damMultiply = Number(proto.dam_multiply);
        this.summon = Number(proto.summon);
        this.drainSp = Number(proto.drain_sp);
        this.mobColor = Number(proto.mob_color);
        this.polymorphItem = Number(proto.polymorph_item);
        this.hpPercentToGetBerserk = Number(proto.sp_berserk);
        this.hpPercentToGetStoneSkin = Number(proto.sp_stoneskin);
        this.hpPercentToGetGodspeed = Number(proto.sp_godspeed);
        this.percentToGetDeathblow = Number(proto.sp_deathblow);
        this.hpPercentToGetRevive = Number(proto.sp_revive);
        this.direction = Number(params.direction);
        this.points = new MobPoints(params.proto);
    }

    addPoint(point: PointsEnum, value: number): void {
        return this.points.addPoint(point, value);
    }

    setPoint(point: PointsEnum, value: number): void {
        return this.points.setPoint(point, value);
    }

    getPoint(point: PointsEnum): number {
        return this.points.getPoint(point);
    }

    protected getChanceToApplyEnchant(type: MobEnchantEnum) {
        return this.enchants.find((enchant) => enchant.type === type)?.value || 0;
    }

    private applyFlags(flagCsv: string | undefined, mapper: { [key: string]: number }, flag: BitFlag) {
        const flags = flagCsv?.split(',');
        flags?.forEach((value) => mapper[value] && flag.set(mapper[value]));
    }

    private loadEnchants(proto: MobsProto) {
        const enchants: Array<[MobEnchantEnum, unknown]> = [
            [MobEnchantEnum.CURSE, proto.enchant_curse],
            [MobEnchantEnum.SLOW, proto.enchant_slow],
            [MobEnchantEnum.POISON, proto.enchant_poison],
            [MobEnchantEnum.STUN, proto.enchant_stun],
            [MobEnchantEnum.CRITICAL, proto.enchant_critical],
            [MobEnchantEnum.PENETRATE, proto.enchant_penetrate],
        ];

        for (const [type, value] of enchants) {
            if (value) this.addEnchant(type, Number(value));
        }
    }

    private loadResists(proto: MobsProto) {
        const resists: Array<[MobResistEnum, unknown]> = [
            [MobResistEnum.SWORD, proto.resist_sword],
            [MobResistEnum.TWOHAND, proto.resist_twohand],
            [MobResistEnum.DAGGER, proto.resist_dagger],
            [MobResistEnum.BELL, proto.resist_bell],
            [MobResistEnum.FAN, proto.resist_fan],
            [MobResistEnum.BOW, proto.resist_bow],
            [MobResistEnum.FIRE, proto.resist_fire],
            [MobResistEnum.ELECT, proto.resist_elect],
            [MobResistEnum.MAGIC, proto.resist_magic],
            [MobResistEnum.WIND, proto.resist_wind],
            [MobResistEnum.POISON, proto.resist_poison],
        ];

        for (const [type, value] of resists) {
            if (value) this.addResist(type, Number(value));
        }
    }

    private loadSkills(proto: MobsProto) {
        const skills: Array<[unknown, unknown]> = [
            [proto.skill_vnum0, proto.skill_level0],
            [proto.skill_vnum1, proto.skill_level1],
            [proto.skill_vnum2, proto.skill_level2],
            [proto.skill_vnum3, proto.skill_level3],
            [proto.skill_vnum4, proto.skill_level4],
        ];

        for (const [vnum, level] of skills) {
            if (vnum && level) this.addSkill(Number(vnum), Number(level));
        }
    }

    private addResist(type: MobResistEnum, value: number) {
        this.resists.push(new MobResist({ type, value }));
    }

    private addEnchant(type: MobEnchantEnum, value: number) {
        this.enchants.push(new MobEnchant({ type, value }));
    }

    private addSkill(id: number, level: number) {
        this.skills.push(new MobSkill({ id, level }));
    }

    isImmuneByFlag(flag: MobImmuneFlagEnum) {
        return this.immuneFlag.is(flag);
    }

    isRaceByFlag(flag: MobRaceFlagEnum) {
        return this.raceFlag.is(flag);
    }

    getResist(resistType: MobResistEnum) {
        return this.resists.find((resist) => resist.type === resistType)?.value || 0;
    }

    getEnchant(enchantType: MobEnchantEnum) {
        return this.enchants.find((enchant) => enchant.type === enchantType)?.value || 0;
    }

    isStoneSkinner(): boolean {
        return this.aiFlag.is(MobAIFlagEnum.STONESKIN);
    }

    isAggresive(): boolean {
        return this.aiFlag.is(MobAIFlagEnum.AGGR);
    }

    isCoward(): boolean {
        return this.aiFlag.is(MobAIFlagEnum.COWARD);
    }

    canAttackShinsu(): boolean {
        return !this.aiFlag.is(MobAIFlagEnum.NOATTACKSHINSU);
    }

    canAttackChunjo(): boolean {
        return !this.aiFlag.is(MobAIFlagEnum.NOATTACKCHUNJO);
    }

    canAttackJinno(): boolean {
        return !this.aiFlag.is(MobAIFlagEnum.NOATTACKJINNO);
    }

    getStoneSkinnerPoint(): number {
        return this.hpPercentToGetStoneSkin;
    }

    isDeathBlower() {
        return this.aiFlag.is(MobAIFlagEnum.DEATHBLOW);
    }

    isImmovable() {
        return this.aiFlag.is(MobAIFlagEnum.NOMOVE);
    }

    getDeathBlowChance() {
        return this.percentToGetDeathblow ?? 0;
    }

    getRank() {
        return this.rank;
    }
    getBattleType() {
        return this.battleType;
    }
    getSize() {
        return this.size;
    }
    getAiFlag() {
        return this.aiFlag;
    }
    getMountCapacity() {
        return this.mountCapacity;
    }
    getRaceFlag() {
        return this.raceFlag;
    }
    getImmuneFlag() {
        return this.immuneFlag;
    }
    getFolder() {
        return this.folder;
    }
    getOnClick() {
        return this.onClick;
    }
    getDamageMin() {
        return this.damageMin;
    }
    getDamageMax() {
        return this.damageMax;
    }
    getRegenCycle() {
        return this.regenCycle;
    }
    getRegenPercent() {
        return this.regenPercent;
    }
    getGoldMin() {
        return this.goldMin;
    }
    getGoldMax() {
        return this.goldMax;
    }
    getExp() {
        return this.exp;
    }
    getDef() {
        return this.def;
    }
    getAggressiveHpPct() {
        return this.aggressiveHpPct;
    }
    getAggressiveSight() {
        return this.aggressiveSight;
    }
    getAttackRange() {
        return this.attackRange;
    }
    getDropItem() {
        return this.dropItem;
    }
    getResurrectionId() {
        return this.resurrectionId;
    }
    getResists() {
        return this.resists;
    }
    getEnchants() {
        return this.enchants;
    }
    getSkills() {
        return this.skills;
    }
    getDamMultiply() {
        return this.damMultiply;
    }
    getSummon() {
        return this.summon;
    }
    getDrainSp() {
        return this.drainSp;
    }
    getMobColor() {
        return this.mobColor;
    }
    getPolymorphItem() {
        return this.polymorphItem;
    }
    getHpPercentToGetBerserk() {
        return this.hpPercentToGetBerserk;
    }
    getHpPercentToGetStoneSkin() {
        return this.hpPercentToGetStoneSkin;
    }
    getHpPercentToGetGodspeed() {
        return this.hpPercentToGetGodspeed;
    }
    getpercentToGetDeathblow() {
        return this.percentToGetDeathblow;
    }
    getHpPercentToGetRevive() {
        return this.hpPercentToGetRevive;
    }
    getDirection() {
        return this.direction;
    }

    getGroup() {
        return this.group;
    }

    setGroup(value: MonsterGroup) {
        this.group = value;
    }

    setPos(pos: PositionEnum) {
        super.setPos(pos);
        if (pos === PositionEnum.FIGHTING) {
            this.stateMachine.gotoState(EntityStateEnum.BATTLE);
            return;
        }
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
    }
}
