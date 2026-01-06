import { MobRankEnum } from '@/core/enum/MobRankEnum';
import Character from '../Character';
import MonsterGroup from './MonsterGroup';
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

enum MobSizeEnum {
    RESERVED = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

class MobResist {
    public readonly type: MobResistEnum;
    public readonly value: number;

    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
}

class MobEnchant {
    public readonly type: MobEnchantEnum;
    public readonly value: number;

    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
}

class MobSkill {
    public readonly id: number;
    public readonly level: number;

    constructor({ id, level }) {
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

    protected group: MonsterGroup;
    protected readonly points: MobPoints;

    constructor(params: MobParams, { animationManager }) {
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
            { animationManager },
        );
        const proto = params.proto;

        this.rank = MobRankEnum[String(proto.rank)] || MobRankEnum.KNIGHT;
        this.battleType = BattleTypeEnum[proto.battle_type] || BattleTypeEnum.MELEE;

        const aiFlags = proto.ai_flag?.split(',');
        aiFlags?.forEach((aiFlag) => MobAIFlagEnum[aiFlag] && this.aiFlag.set(MobAIFlagEnum[aiFlag]));

        const raceFlags = proto.race_flag?.split(',');
        raceFlags?.forEach((raceFlag) => MobRaceFlagEnum[raceFlag] && this.raceFlag.set(MobRaceFlagEnum[raceFlag]));

        const immuneFlags = proto.immune_flag?.split(',');
        immuneFlags?.forEach(
            (immuneFlag) => MobImmuneFlagEnum[immuneFlag] && this.immuneFlag.set(MobImmuneFlagEnum[immuneFlag]),
        );

        if (proto.enchant_curse) this.addEnchant(MobEnchantEnum.CURSE, Number(proto.enchant_curse));
        if (proto.enchant_slow) this.addEnchant(MobEnchantEnum.SLOW, Number(proto.enchant_slow));
        if (proto.enchant_poison) this.addEnchant(MobEnchantEnum.POISON, Number(proto.enchant_poison));
        if (proto.enchant_stun) this.addEnchant(MobEnchantEnum.STUN, Number(proto.enchant_stun));
        if (proto.enchant_critical) this.addEnchant(MobEnchantEnum.CRITICAL, Number(proto.enchant_critical));
        if (proto.enchant_penetrate) this.addEnchant(MobEnchantEnum.PENETRATE, Number(proto.enchant_penetrate));

        if (proto.resist_sword) this.addResist(MobResistEnum.SWORD, Number(proto.resist_sword));
        if (proto.resist_twohand) this.addResist(MobResistEnum.TWOHAND, Number(proto.resist_twohand));
        if (proto.resist_dagger) this.addResist(MobResistEnum.DAGGER, Number(proto.resist_dagger));
        if (proto.resist_bell) this.addResist(MobResistEnum.BELL, Number(proto.resist_bell));
        if (proto.resist_fan) this.addResist(MobResistEnum.FAN, Number(proto.resist_fan));
        if (proto.resist_bow) this.addResist(MobResistEnum.BOW, Number(proto.resist_bow));
        if (proto.resist_fire) this.addResist(MobResistEnum.FIRE, Number(proto.resist_fire));
        if (proto.resist_elect) this.addResist(MobResistEnum.ELECT, Number(proto.resist_elect));
        if (proto.resist_magic) this.addResist(MobResistEnum.MAGIC, Number(proto.resist_magic));
        if (proto.resist_wind) this.addResist(MobResistEnum.WIND, Number(proto.resist_wind));
        if (proto.resist_poison) this.addResist(MobResistEnum.POISON, Number(proto.resist_poison));

        if (proto.skill_level0 && proto.skill_vnum0)
            this.addSkill(Number(proto.skill_vnum0), Number(proto.skill_level0));
        if (proto.skill_level1 && proto.skill_vnum1)
            this.addSkill(Number(proto.skill_vnum1), Number(proto.skill_level1));
        if (proto.skill_level2 && proto.skill_vnum2)
            this.addSkill(Number(proto.skill_vnum2), Number(proto.skill_level2));
        if (proto.skill_level3 && proto.skill_vnum3)
            this.addSkill(Number(proto.skill_vnum3), Number(proto.skill_level3));
        if (proto.skill_level4 && proto.skill_vnum4)
            this.addSkill(Number(proto.skill_vnum4), Number(proto.skill_level4));

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
}
