import DropManager from '@/core/domain/manager/DropManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import MathUtil from '../../../util/MathUtil';
import Player from '../player/Player';
import Behavior from './behavior/Behavior';
import MonsterMovedEvent from './events/MonsterMovedEvent';
import { Mob, MobParams } from './Mob';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import { PositionEnum } from '@/core/enum/PositionEnum';
import MonsterBattle from './delegate/battle/MonsterBattle';

const MAX_DISTANCE_TO_GET_EXP = 5_000;

export default class Monster extends Mob {
    private readonly behavior: Behavior;
    private behaviorInitialized: boolean = false;

    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;
    protected readonly battle: MonsterBattle;

    constructor(
        params: Omit<MobParams, 'virtualId' | 'entityType'>,
        { animationManager, dropManager, experienceManager, logger },
    ) {
        super(
            {
                ...params,
                entityType: EntityTypeEnum.MONSTER,
            },
            { animationManager },
        );
        this.dropManager = dropManager;
        this.experienceManager = experienceManager;
        this.behavior = new Behavior(this);
        this.battle = new MonsterBattle(this, logger);

        this.stateMachine
            .addState({
                name: EntityStateEnum.IDLE,
                onTick: this.idleStateTick.bind(this),
                onStart: this.idleStateStart.bind(this),
            })
            .addState({
                name: EntityStateEnum.MOVING,
                onTick: this.movingStateTick.bind(this),
            })
            .addState({
                name: EntityStateEnum.BATTLE,
                onTick: this.battleStateTick.bind(this),
            })
            .gotoState(EntityStateEnum.IDLE);
    }

    stun() {
        super.stun();
        this.sendUpdateEvent();
    }

    removeStun() {
        super.removeStun();
        this.sendUpdateEvent();
    }

    getTarget(): Player {
        return this.target as Player;
    }

    battleStateTick(): void {
        this.behavior.battleState();
    }

    movingStateTick(): void {
        super.movingStateTick();
        this.behavior.movingState();
    }

    idleStateTick(): void {
        super.idleStateTick();
        if (!this.behaviorInitialized) {
            this.behavior.init();
            this.behaviorInitialized = true;
        }
        this.behavior.idleState();
    }

    idleStateStart(): void {
        super.idleStateStart();
    }

    createRespawnEvent() {
        const event = 'RESPAWN';

        if (this.eventTimerManager.isTimerActive(event)) return;

        const respawnTime = this.getRespawnTimeInMs();

        this.eventTimerManager.addTimer({
            id: event,
            eventFunction: () => {
                this.area.spawn(this);
            },
            options: {
                repeatCount: 1,
                interval: respawnTime,
                duration: respawnTime,
            },
        });
    }

    die() {
        super.die();

        for (const entity of this.getNearbyEntities().values()) {
            if (entity instanceof Player) {
                entity.otherEntityDied(this);
            }
        }

        this.addEventTimer({
            eventFunction: () => {
                this.area.despawn(this);
            },
            id: 'DESPAWN',
            options: {
                repeatCount: 1,
                duration: 2_000,
                interval: 2_000,
            },
        });
    }

    onSpawn(): void {
        this.reset();
    }

    onDespawn(): void {
        this.eventTimerManager.clearAllTimers();
        if (this.group.allDead()) {
            this.group.createRespawnEvent();
        }
    }

    private initEvents() {
        this.eventTimerManager.addTimer({
            id: 'REGEN_HEALTH',
            eventFunction: this.regenHealth.bind(this),
            options: {
                interval: this.regenCycle * 1_000,
            },
        });
    }

    public sendUpdateEvent() {
        for (const entity of this.nearbyEntities.values()) {
            if (entity instanceof Player) {
                entity.otherEntityUpdated({
                    affects: this.getAffectFlags(),
                    attackSpeed: this.getAttackSpeed(),
                    moveSpeed: this.getMovementSpeed(),
                    bodyId: 0,
                    hairId: 0,
                    weaponId: 0,
                    vid: this.getVirtualId(),
                });
            }
        }
    }

    private regenHealth() {
        if (this.isDead()) return;
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;
        if (this.points.getPoint(PointsEnum.HEALTH) >= this.points.getPoint(PointsEnum.MAX_HEALTH)) return;

        const amount = Math.floor(this.points.getPoint(PointsEnum.MAX_HEALTH) * (this.regenPercent / 100));
        this.points.addPoint(PointsEnum.HEALTH, Math.max(1, amount));
        this.broadcastMyTarget();
    }

    getHealthPercentage() {
        return Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    (this.points.getPoint(PointsEnum.HEALTH) * 100) / this.points.getPoint(PointsEnum.MAX_HEALTH),
                ),
            ),
        );
    }

    takeDamage(attacker: Player, damage: number) {
        if (attacker.isDead()) return;
        if (this.isDead()) return;
        this.points.addPoint(PointsEnum.HEALTH, -damage);
        this.behavior.onDamage(attacker, damage);

        this.broadcastMyTarget();
        this.setPos(PositionEnum.FIGHTING);

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            this.die();
            this.reward();
            return;
        }
    }

    private reward() {
        const attacker = this.getTarget();
        const drops = this.dropManager.getDrops(attacker, this);

        for (const { item, count } of drops) {
            attacker.dropItem({ item, count });
        }

        this.giveExp();
    }

    private giveExp() {
        const exp = this.getExp();

        const attackersSize = this.behavior.getAttackersSize();
        const mostDamageAttacker = this.getTarget();

        for (const { player } of this.behavior.getAttackers()) {
            let playerExp = exp / attackersSize;

            if (player === mostDamageAttacker) {
                playerExp *= 1.2;
            }

            const distance = MathUtil.calcDistance(
                player.getPositionX(),
                player.getPositionY(),
                this.getPositionX(),
                this.getPositionY(),
            );

            if (distance > MAX_DISTANCE_TO_GET_EXP) {
                continue;
            }

            const expToGive = this.experienceManager.calculateExpToGive(player, this, playerExp);

            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `[SYSTEM] Earned ${expToGive} of EXP after kill ${this.folder || this.name}`,
            });

            player.addPoint(PointsEnum.EXPERIENCE, expToGive);

            this.createFlyEffect(player.getVirtualId(), FlyEnum.EXP);
        }
    }

    goto(x: number, y: number) {
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
        const rotation = MathUtil.calcRotationFromXY(x - this.positionX, y - this.positionY) / 5;
        super.gotoInternal(x, y, rotation);
        this.area.onMonsterMove(
            new MonsterMovedEvent({
                params: {
                    positionX: x,
                    positionY: y,
                    arg: 0,
                    rotation,
                    time: performance.now(),
                    duration: this.movementDuration,
                    movementType: MovementTypeEnum.WAIT,
                },
                entity: this,
            }),
        );
    }

    tick() {
        if (this.nearbyEntities.size < 1) return;
        super.tick();
    }

    getDefense() {
        return this.points.getPoint(PointsEnum.DEFENSE);
    }

    getRespawnTimeInMs() {
        return this.group?.getSpawnConfig()?.getRespawnTimeInMs();
    }

    reset() {
        this.behaviorInitialized = false;
        this.setTarget(undefined);
        this.setPos(PositionEnum.STANDING);
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
        this.points.calcPointsAndResetValues();
        this.initEvents();
    }

    setState(state: EntityStateEnum) {
        this.stateMachine.gotoState(state);
    }

    getAttack(): number {
        return this.points.getPoint(PointsEnum.ATTACK_GRADE);
    }

    attack(victim: Player): void {
        this.area.onMonsterMove(
            new MonsterMovedEvent({
                params: {
                    positionX: this.getPositionX(),
                    positionY: this.getPositionY(),
                    arg: 0,
                    rotation: this.getRotation() / 5,
                    time: performance.now(),
                    duration: 0,
                    movementType: MovementTypeEnum.ATTACK,
                },
                entity: this,
            }),
        );
        this.battle.execute(AttackTypeEnum.NORMAL, victim);
    }

    damage(): number {
        throw new Error('Method not implemented.');
    }
}
