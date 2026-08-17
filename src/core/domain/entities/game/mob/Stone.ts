import { QuestManager } from '@/core/domain/quests/QuestManager';
import { Mob, MobParams } from './Mob';
import Monster from './Monster';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import Player from '../player/Player';
import Character from '../Character';
import { Groups } from '@/game/infra/config/GameConfig';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';

const IDLE_TICK_ID = 'STONE_IDLE_TICK';
const IDLE_TICK_INTERVAL_MS = 1_000;

type IdleSpawnTier = { maxPercent: number; groupRadii: Array<number> };

const IDLE_SPAWN_TIERS: Array<IdleSpawnTier> = [
    { maxPercent: 10, groupRadii: [500, 1000, 1500] },
    { maxPercent: 20, groupRadii: [500, 1000, 1500] },
    { maxPercent: 30, groupRadii: [500, 1000, 1000] },
    { maxPercent: 40, groupRadii: [1000, 1000, 1000] },
    { maxPercent: 50, groupRadii: [1000, 1000] },
    { maxPercent: 60, groupRadii: [1000, 500] },
    { maxPercent: 70, groupRadii: [500, 1000] },
    { maxPercent: 80, groupRadii: [1000, 1000] },
    { maxPercent: 90, groupRadii: [500] },
    { maxPercent: 99, groupRadii: [1000] },
];

export default class Stone extends Mob {
    private readonly groups: Array<Groups>;
    private readonly spawnedMonsters = new Set<Monster>();
    private readonly firedIdleTiers = new Set<number>();

    constructor(
        params: Omit<MobParams, 'entityType'>,
        {
            animationManager,
            questManager,
            eventTimerManager,
            groups,
        }: {
            animationManager: AnimationManager;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
            groups: Array<Groups>;
        },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.METIN_STONE,
            },
            { animationManager, questManager, eventTimerManager },
        );
        this.groups = groups;
    }

    onSpawn(): void {
        this.points.calcPointsAndResetValues();
        this.firedIdleTiers.clear();
        this.spawnedMonsters.clear();
        this.startIdleTick();
        this.initEvents();
    }

    onDespawn(): void {
        this.removeTimers();
        this.clearSpawnedMonsters();
    }

    getHealthPercentage(): number {
        return Math.round(
            Math.max(0, Math.min(100, (this.getPoint(PointsEnum.HEALTH) * 100) / this.getPoint(PointsEnum.MAX_HEALTH))),
        );
    }

    /** Stones never attack - this only exists to satisfy Character's abstract contract. */
    getAttack(): number {
        return 0;
    }

    getDefense(): number {
        return this.points.getPoint(PointsEnum.DEFENSE);
    }

    die(killer?: Character) {
        super.die(killer);

        this.clearSpawnedMonsters();

        for (const entity of this.getNearbyEntities().values()) {
            if (entity instanceof Player) {
                entity.otherEntityDied(this);
            }
        }

        this.addEventTimer({
            eventFunction: () => {
                this.area?.despawn(this);
            },
            id: TimedEventsEnum.DESPAWN,
            options: { repeatCount: 1, duration: 2_000, interval: 2_000 },
        });
    }

    private clearSpawnedMonsters() {
        for (const monster of this.spawnedMonsters) {
            if (!monster.isDead()) monster.die();
        }
        this.spawnedMonsters.clear();
    }

    takeDamage(attacker: Player, damage: number): void {
        if (attacker.isDead()) return;
        if (this.isDead()) return;

        this.points.addPoint(PointsEnum.HEALTH, -damage);
        this.broadcastMyTarget();

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            this.die(attacker);
        }
    }

    /** Mirrors Monster's own initEvents/regenHealth (recovery_event, char.cpp:2308-2379): the
     * original's `!ch->IsPC()` branch regenerates any non-PC character, stones included - there's no
     * IsStone() exclusion in it. */
    private initEvents(): void {
        this.addEventTimer({
            id: TimedEventsEnum.REGEN_HEALTH,
            eventFunction: this.regenHealth.bind(this),
            options: {
                interval: this.regenCycle * 1_000,
            },
        });
    }

    private regenHealth(): void {
        if (this.isDead()) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;
        if (this.points.getPoint(PointsEnum.HEALTH) >= this.points.getPoint(PointsEnum.MAX_HEALTH)) return;

        const amount = Math.floor(this.points.getPoint(PointsEnum.MAX_HEALTH) * (this.regenPercent / 100));
        this.points.addPoint(PointsEnum.HEALTH, Math.max(1, amount));
        this.broadcastMyTarget();
    }

    private startIdleTick(): void {
        if (this.isEventTimerActive(IDLE_TICK_ID)) return;

        this.addEventTimer({
            id: IDLE_TICK_ID,
            eventFunction: () => this.idleTick(),
            options: { interval: IDLE_TICK_INTERVAL_MS },
        });
    }

    private idleTick(): void {
        if (this.isDead()) return;

        const percent = this.getHealthPercentage();
        const tier = IDLE_SPAWN_TIERS.find((t) => percent <= t.maxPercent && !this.firedIdleTiers.has(t.maxPercent));
        if (!tier) return;

        this.firedIdleTiers.add(tier.maxPercent);

        this.broadcastAttackMotion();

        const vnumMin = Math.min(this.getPoint(PointsEnum.ATTACK_SPEED), this.getPoint(PointsEnum.MOVE_SPEED));
        const vnumMax = Math.max(this.getPoint(PointsEnum.ATTACK_SPEED), this.getPoint(PointsEnum.MOVE_SPEED));

        for (const radius of tier.groupRadii) {
            const groupVnum = MathUtil.getRandomInt(vnumMin, vnumMax);
            this.spawnGroupInBox(
                groupVnum,
                this.getPositionX() - radius,
                this.getPositionY() - radius,
                this.getPositionX() + radius,
                this.getPositionY() + radius,
            );
        }

        this.sendUpdateEvent();
    }

    /**
     * Mirrors CHARACTER::SendMovePacket (char.cpp:2738-2751): a plain broadcast of the current attack
     * motion to whoever is already watching this character (PacketView), with NO effect on AOI
     * membership. The stone is stationary, so re-running the same nearby-entity add/remove diffing
     * that real movement needs (CHARACTER_MANAGER's aoi.updatePosition + queryAround, as
     * Area.onMonsterMove does) is both unnecessary and risks pruning a still-nearby player from view
     * (they'd get hideOtherEntity'd with no error logged) - exactly the "stone vanishes on a threshold
     * tick" symptom this replaces. Same viewer-only broadcast shape as Character.createFlyEffect.
     */
    private broadcastAttackMotion(): void {
        const rotation = this.getRotation() / 5;
        const time = performance.now();

        for (const entity of this.getNearbyEntities().values()) {
            if (entity instanceof Player) {
                entity.updateOtherEntity({
                    virtualId: this.getVirtualId(),
                    arg: 0,
                    movementType: MovementTypeEnum.ATTACK,
                    time,
                    rotation,
                    positionX: this.getPositionX(),
                    positionY: this.getPositionY(),
                    duration: 0,
                });
            }
        }
    }

    private spawnGroupInBox(vnum: number, minX: number, minY: number, maxX: number, maxY: number) {
        const group = this.groups.find((g) => Number(g.vnum) === vnum);
        if (!group) return;

        let boxMinX = minX;
        let boxMinY = minY;
        let boxMaxX = maxX;
        let boxMaxY = maxY;

        for (const member of group.mobs) {
            const x = MathUtil.getRandomInt(boxMinX, boxMaxX);
            const y = MathUtil.getRandomInt(boxMinY, boxMaxY);

            const monster = this.area?.spawnMob(Number(member.vnum), x, y, 0, true);
            if (monster instanceof Monster) {
                monster.setShouldProtectStone(true);
                this.spawnedMonsters.add(monster);

                boxMinX = x - MathUtil.getRandomInt(300, 500);
                boxMinY = y - MathUtil.getRandomInt(300, 500);
                boxMaxX = x + MathUtil.getRandomInt(300, 500);
                boxMaxY = y + MathUtil.getRandomInt(300, 500);
            }
        }
    }
}
