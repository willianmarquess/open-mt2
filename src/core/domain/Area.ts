import Queue from '../util/Queue';
import GameEntity from './entities/game/GameEntity';
import Player from './entities/game/player/Player';
import MathUtil from './util/MathUtil';
import SpawnManager from '@/core/domain/manager/SpawnManager';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import Character from './entities/game/Character';
import MonsterMovedEvent from './entities/game/mob/events/MonsterMovedEvent';
import SpatialGrid from '../util/SpatialGrid';
import { EmpireEnum } from '../enum/EmpireEnum';
import EmpireUtil from './util/EmpireUtil';
import Item from './entities/game/item/Item';
import { AtlasInfoGoto } from '@/game/infra/config/GameConfig';
import { EntityManager } from './manager/EntityManager';
import MapAttributeGrid from '../util/MapAttributeGrid';
import * as path from 'node:path';

const SIZE_QUEUE = 5_000;
const CHAR_VIEW_SIZE = 8000;
const SPAWN_POSITION_MULTIPLIER = 100;
const DEFAULT_ATTR_CONFIG_PATH = 'src/core/infra/config/data/attr';
const SPAWN_FREE_POSITION_RADIUS = 500;
const SPAWN_FREE_POSITION_RETRIES = 16;

export default class Area {
    private readonly name: string;
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly width: number;
    private readonly height: number;
    private readonly aka?: string;
    private readonly goto?: AtlasInfoGoto;

    private readonly entitiesToSpawn = new Queue<GameEntity>(SIZE_QUEUE);
    private readonly entitiesToDespawn = new Queue<GameEntity>(SIZE_QUEUE);
    private readonly aoi: SpatialGrid;
    private readonly spawnManager: SpawnManager;
    private readonly entityManager: EntityManager;
    private attributes: MapAttributeGrid;

    constructor(
        {
            name,
            positionX,
            positionY,
            width,
            height,
            aka,
            goto,
        }: {
            name: string;
            positionX: number;
            positionY: number;
            width: number;
            height: number;
            aka?: string;
            goto?: AtlasInfoGoto;
        },
        {
            spawnManager,
            entityManager,
        }: {
            spawnManager: SpawnManager;
            entityManager: EntityManager;
        },
    ) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.width = width;
        this.height = height;
        this.aka = aka;
        this.goto = goto;
        this.aoi = new SpatialGrid(CHAR_VIEW_SIZE * 2);

        this.spawnManager = spawnManager;
        this.entityManager = entityManager;
        this.attributes = MapAttributeGrid.empty(positionX, positionY);
    }

    //TODO: add system do choose which map will be generated on this server
    async load() {
        this.attributes = MapAttributeGrid.load(
            path.join(process.cwd(), DEFAULT_ATTR_CONFIG_PATH),
            this.name.split('/').pop() ?? this.name,
            this.positionX,
            this.positionY,
        );

        const entitiesToSpawn = await this.spawnManager.getEntities(this.name);
        entitiesToSpawn.forEach((entity) => {
            entity.setPositionY(this.positionY + entity.getPositionY() * SPAWN_POSITION_MULTIPLIER);
            entity.setPositionX(this.positionX + entity.getPositionX() * SPAWN_POSITION_MULTIPLIER);

            const freePosition = this.attributes.findFreePositionNear(
                entity.getPositionX(),
                entity.getPositionY(),
                SPAWN_FREE_POSITION_RADIUS,
                SPAWN_FREE_POSITION_RETRIES,
            );
            if (freePosition) {
                entity.setPositionX(freePosition.x);
                entity.setPositionY(freePosition.y);
            }

            entity.setRotation(MathUtil.calcRotationFromDirection(entity.getDirection()));
            this.spawn(entity);
        });
    }

    getAttributes() {
        return this.attributes;
    }

    isPositionBlocked(x: number, y: number) {
        return this.attributes.isPositionBlocked(x, y);
    }

    getPositionX() {
        return this.positionX;
    }
    getPositionY() {
        return this.positionY;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getName() {
        return this.name;
    }
    getAka() {
        return this.aka;
    }
    getGoto() {
        return this.goto;
    }

    getStartPositionByEmpire(empire: EmpireEnum) {
        const empireName = EmpireUtil.getEmpireName(empire);
        const [x, y] = this.goto?.[empireName] || this.goto?.default || [];
        return {
            x,
            y,
        };
    }

    onItemDrop(itemDropEvent: { item: Item; count: number; positionX: number; positionY: number; ownerName: string }) {
        const droppedItem = this.entityManager.createDroppedItem(itemDropEvent);
        this.spawn(droppedItem);
    }

    spawn(entity: GameEntity) {
        this.entitiesToSpawn.enqueue(entity);
    }

    despawn(entity: GameEntity) {
        this.entitiesToDespawn.enqueue(entity);
    }

    onMonsterMove(monsterMovedEvent: MonsterMovedEvent) {
        const {
            entity: monster,
            params: { positionX, positionY, arg, rotation, time, movementType, duration },
        } = monsterMovedEvent;
        this.aoi.updatePosition(monster);
        const players = this.aoi.queryAround(monster, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<number, Player>;

        for (const player of players.values()) {
            if (monster.isNearby(player)) {
                player.updateOtherEntity({
                    virtualId: monster.getVirtualId(),
                    arg,
                    movementType,
                    time,
                    rotation,
                    positionX,
                    positionY,
                    duration,
                });
            } else {
                monster.addNearbyEntity(player);
                player.addNearbyEntity(monster);
            }
        }

        for (const [virtualId, player] of monster.getNearbyEntities().entries()) {
            if (!players.has(virtualId)) {
                monster.removeNearbyEntity(player);
                player.removeNearbyEntity(monster);
            }
        }
    }

    onCharacterMove(characterMovedEvent: {
        entity: GameEntity;
        params: {
            positionX: number;
            positionY: number;
            arg: number;
            rotation: number;
            time: number;
            movementType: number;
            duration: number;
        };
    }) {
        const {
            entity,
            params: { positionX, positionY, arg, rotation, time, movementType, duration },
        } = characterMovedEvent;

        this.aoi.updatePosition(entity);

        const entities = this.aoi.queryAround(entity, CHAR_VIEW_SIZE);

        for (const otherEntity of entities.values()) {
            if (otherEntity.getVirtualId() === entity.getVirtualId()) continue;

            if (!entity.isNearby(otherEntity)) {
                entity.addNearbyEntity(otherEntity);
                otherEntity.addNearbyEntity(entity);
            }
        }

        for (const [virtualId, nearbyEntity] of entity.getNearbyEntities().entries()) {
            if (!entities.has(virtualId)) {
                entity.removeNearbyEntity(nearbyEntity);
                nearbyEntity.removeNearbyEntity(entity);
            }
        }

        for (const otherEntity of entity.getNearbyEntities().values()) {
            if (entity.isNearby(otherEntity)) {
                if (otherEntity instanceof Player) {
                    otherEntity.updateOtherEntity({
                        virtualId: entity.getVirtualId(),
                        arg,
                        movementType,
                        time,
                        rotation,
                        positionX,
                        positionY,
                        duration,
                    });
                }
            }
        }
    }

    tick() {
        this.processSpawnQueue();
        this.processDespawnQueue();
    }

    private processSpawnQueue() {
        for (const entity of this.entitiesToSpawn.dequeueIterator()) {
            if (!entity) continue;
            entity.onSpawn();
            this.aoi.insert(entity);
            this.linkNearbyEntities(entity);
            this.entityManager.addEntity(entity);
            entity.setArea(this);
        }
    }

    private linkNearbyEntities(entity: GameEntity) {
        const entities = this.aoi.queryAround(
            entity,
            CHAR_VIEW_SIZE,
            entity.getEntityType() !== EntityTypeEnum.PLAYER ? EntityTypeEnum.PLAYER : undefined,
        );

        for (const otherEntity of entities.values()) {
            if (otherEntity.getVirtualId() === entity.getVirtualId()) continue;

            entity.addNearbyEntity(otherEntity);

            if (otherEntity instanceof Character) {
                otherEntity.addNearbyEntity(entity);
            }
        }
    }

    private processDespawnQueue() {
        for (const entity of this.entitiesToDespawn.dequeueIterator()) {
            if (!entity) continue;
            const entities = this.aoi.queryAround(entity, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<number, Player>;

            for (const otherEntity of entities.values()) {
                if (entity instanceof Character) {
                    entity.removeNearbyEntity(otherEntity);
                }

                if (otherEntity instanceof Character) {
                    otherEntity.removeNearbyEntity(entity);
                }
            }

            this.entityManager.removeEntity(entity);
            this.aoi.remove(entity);
            entity.onDespawn();
        }
    }
}
