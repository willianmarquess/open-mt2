import DropManager from '@/core/domain/manager/DropManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import MathUtil from '../../../util/MathUtil';
import Player from '../player/Player';
import CharacterUpdatedEvent from '../shared/event/CharacterUpdatedEvent';
import FlyEffectCreatedEvent from '../shared/event/FlyEffectCreatedEvent';
import Behavior from './Behavior';
import MonsterDiedEvent from './events/MonsterDiedEvent';
import MonsterMovedEvent from './events/MonsterMovedEvent';
import { Mob, MobParams } from './Mob';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import BattleServiceFactory from '@/core/domain/service/battle/BattleServiceFactory';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';

const MAX_DISTANCE_TO_GET_EXP = 5_000;

export default class Monster extends Mob {
    private readonly behavior: Behavior;
    private behaviorInitialized: boolean = false;
    // private health: number = 0;

    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;
    private readonly battleServiceFactory: BattleServiceFactory;

    constructor(
        params: Omit<MobParams, 'virtualId' | 'entityType'>,
        { animationManager, dropManager, experienceManager, battleServiceFactory },
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
        this.battleServiceFactory = battleServiceFactory;
        this.behavior = new Behavior(this);

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
                name: EntityStateEnum.DEAD,
                onTick: this.deadStateTick.bind(this),
                onStart: this.deadStateStart.bind(this),
            })
            .gotoState(EntityStateEnum.IDLE);
        this.init();
    }

    protected movingStateTick(): void {
        super.movingStateTick();
    }

    protected idleStateTick(): void {
        super.idleStateTick();
        if (!this.behaviorInitialized) {
            this.behavior.init();
            this.behaviorInitialized = true;
        }
    }

    protected idleStateStart(): void {
        super.idleStateStart();
    }

    protected deadStateStart(): void {
        super.deadStateStart();

        this.area.onMonsterDied(
            new MonsterDiedEvent({
                entity: this,
            }),
        );
    }

    protected deadStateTick() {
        super.deadStateTick();
    }

    private init() {
        this.points.calcPoints();
        this.initEvents();
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
        this.area.onCharacterUpdate(
            new CharacterUpdatedEvent({
                affects: this.getAffectFlags(),
                attackSpeed: this.getAttackSpeed(),
                moveSpeed: this.getMovementSpeed(),
                bodyId: 0,
                hairId: 0,
                weaponId: 0,
                name: this.name,
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                vid: this.getVirtualId(),
            }),
        );
    }

    private regenHealth() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.POISON)) return;
        if (this.points.getPoint(PointsEnum.HEALTH) >= this.points.getPoint(PointsEnum.MAX_HEALTH)) return;
        if (this.stateMachine.getCurrentState().name === 'DEAD') return;

        const amount = Math.floor(this.points.getPoint(PointsEnum.MAX_HEALTH) * (this.regenPercent / 100));
        this.points.addPoint(PointsEnum.HEALTH, Math.max(1, amount));
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
        this.points.addPoint(PointsEnum.HEALTH, -damage);
        this.behavior.onDamage(attacker, damage);

        this.broadcastMyTarget();

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            this.die();
            this.reward();
            return;
        }
    }

    private reward() {
        const attacker = this.behavior.getTarget();
        const drops = this.dropManager.getDrops(attacker, this);

        for (const { item, count } of drops) {
            attacker.dropItem({ item, count });
        }

        this.giveExp();
    }

    private giveExp() {
        const exp = this.getExp();

        const attackersSize = this.behavior.getTargets().size;
        const mostDamageAttacker = this.behavior.getTarget();

        for (const { player } of this.behavior.getTargets().values()) {
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

            this.area.onFlyEffect(
                new FlyEffectCreatedEvent({
                    fromVirtualId: this.virtualId,
                    toVirtualId: player.getVirtualId(),
                    type: FlyEnum.EXP,
                }),
            );
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
                },
                entity: this,
            }),
        );
    }

    tick() {
        if (this.nearbyEntities.size < 1) return;
        super.tick();
        this.behavior?.tick?.();
    }

    getDefense() {
        return this.points.getPoint(PointsEnum.DEFENSE);
    }

    getRespawnTimeInMs() {
        return this.group?.getSpawnConfig()?.getRespawnTimeInMs();
    }

    reset() {
        this.behaviorInitialized = false;
        this.behavior.setTarget(null);
        this.stateMachine.gotoState(EntityStateEnum.IDLE);
        this.points.calcPointsAndResetValues();
        this.initEvents();
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
        const battleService = this.battleServiceFactory.createBattleService(this, victim);
        battleService.execute(AttackTypeEnum.NORMAL);
    }

    damage(): number {
        throw new Error('Method not implemented.');
    }
}
