import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import Queue from '../util/Queue';
import GameEntity from './entities/game/GameEntity';
import DroppedItem from './entities/game/item/DroppedItem';
import Player from './entities/game/player/Player';
import MathUtil from './util/MathUtil';
import Logger from '@/core/infra/logger/Logger';
import World from '@/core/domain/World';
import SpawnManager from '@/core/domain/manager/SpawnManager';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import Character from './entities/game/Character';
import CharacterMovedEvent from './entities/game/player/events/CharacterMovedEvent';
import MonsterMovedEvent from './entities/game/mob/events/MonsterMovedEvent';
import MonsterDiedEvent from './entities/game/mob/events/MonsterDiedEvent';
import DropItemEvent from './entities/game/player/events/DropItemEvent';
import SpatialGrid from '../util/SpatialGrid';

const SIZE_QUEUE = 5_000;
const CHAR_VIEW_SIZE = 10000;
const SAVE_PLAYERS_INTERVAL = 120000;
const REMOVE_ITEM_FROM_GROUND = 30000;
const SPAWN_POSITION_MULTIPLIER = 100;

export default class Area {
    private readonly name: string;
    private readonly positionX: number;
    private readonly positionY: number;
    private readonly width: number;
    private readonly height: number;
    private readonly aka: string;
    private readonly goto?: {
        red: Array<number>;
        yellow: Array<number>;
        blue: Array<number>;
        default: Array<number>;
    };

    private readonly entities = new Map<number, GameEntity>();
    private readonly entitiesToSpawn = new Queue<GameEntity>(SIZE_QUEUE);
    private readonly entitiesToDespawn = new Queue<GameEntity>(SIZE_QUEUE);
    private readonly aoi: SpatialGrid;

    private readonly saveCharacterService: SaveCharacterService;
    private readonly logger: Logger;

    private readonly world: World;
    private readonly spawnManager: SpawnManager;

    constructor(
        { name, positionX, positionY, width, height, aka, goto },
        { saveCharacterService, logger, world, spawnManager },
    ) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.width = width;
        this.height = height;
        this.aka = aka;
        this.goto = goto;
        // this.aoi = new QuadTree(positionX, positionY, width * 25600, height * 25600, 50);
        this.aoi = new SpatialGrid(CHAR_VIEW_SIZE / 2);

        this.saveCharacterService = saveCharacterService;
        this.logger = logger;

        this.world = world;
        this.spawnManager = spawnManager;

        setInterval(this.savePlayers.bind(this), SAVE_PLAYERS_INTERVAL);
    }

    //TODO: add system do choose which map will be generated on this server
    //to be able to only deal with the map we want to deal with.
    async load() {
        const entitiesToSpawn = await this.spawnManager.getEntities(this.name);
        entitiesToSpawn.forEach((entity) => {
            entity.setVirtualId(this.world.generateVirtualId());
            entity.setPositionY(this.positionY + entity.getPositionY() * SPAWN_POSITION_MULTIPLIER);
            entity.setPositionX(this.positionX + entity.getPositionX() * SPAWN_POSITION_MULTIPLIER);
            entity.setRotation(MathUtil.calcRotationFromDirection(entity.getDirection()));
            this.spawn(entity);
        });
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

    getEntity(virtualId: number) {
        return this.entities.get(virtualId);
    }

    onItemDrop(itemDropEvent: DropItemEvent) {
        const { item, count, positionX, positionY, ownerName } = itemDropEvent;
        const virtualId = this.world.generateVirtualId();
        const droppedItem = DroppedItem.create({
            item,
            count,
            ownerName,
            virtualId,
            positionX,
            positionY,
        });
        this.spawn(droppedItem);
        //TODO: add logic to removed onwer first, then after 3 min remove item from ground
        setTimeout(() => {
            if (this.entities.has(virtualId)) {
                this.despawn(droppedItem);
            }
        }, REMOVE_ITEM_FROM_GROUND);
    }

    async savePlayers() {
        if (this.entities.size < 1) return;

        const promises = [];

        for (const entity of this.entities.values()) {
            if (entity instanceof Player) {
                this.logger.debug(`[AREA] Saving player: ${entity.getId()}, ${entity.getName()}`);
                promises.push(this.saveCharacterService.execute(entity));
            }
        }
        //TODO: refact this sending to a queue and save behind scenes (other process)
        return Promise.all(promises).catch((error) =>
            this.logger.error('[AREA] Error when try to save player: ', error),
        );
    }

    spawn(entity: GameEntity) {
        this.entitiesToSpawn.enqueue(entity);
    }

    despawn(entity: GameEntity) {
        this.entitiesToDespawn.enqueue(entity);
    }

    onMonsterDied(monsterDiedEvent: MonsterDiedEvent) {
        const { entity: monster } = monsterDiedEvent;
        const players = this.aoi.queryAround(monster, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<number, Player>;

        for (const player of players.values()) {
            player.otherEntityDied(monster);
        }

        this.despawn(monster);
        const respawnTime = monster.getRespawnTimeInMs();

        if (!respawnTime) return;

        //TODO: verify if all monsters in group are dead.

        setTimeout(() => {
            monster.reset();
            this.spawn(monster);
        }, respawnTime);
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

    onCharacterMove(characterMovedEvent: CharacterMovedEvent) {
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
        for (const entity of this.entitiesToSpawn.dequeueIterator()) {
            this.aoi.insert(entity);

            const entities = this.aoi.queryAround(
                entity,
                CHAR_VIEW_SIZE,
                entity.getEntityType() !== EntityTypeEnum.PLAYER ? EntityTypeEnum.PLAYER : null,
            );

            for (const otherEntity of entities.values()) {
                if (otherEntity.getVirtualId() === entity.getVirtualId()) continue;

                if (entity instanceof Character) {
                    entity.addNearbyEntity(otherEntity);
                }

                if (otherEntity instanceof Character) {
                    otherEntity.addNearbyEntity(entity);
                }
            }

            this.entities.set(entity.getVirtualId(), entity);
            entity.setArea(this);
        }

        for (const entity of this.entitiesToDespawn.dequeueIterator()) {
            const entities = this.aoi.queryAround(entity, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<number, Player>;

            for (const otherEntity of entities.values()) {
                if (entity instanceof Character) {
                    entity.removeNearbyEntity(otherEntity);
                }

                if (otherEntity instanceof Character) {
                    otherEntity.removeNearbyEntity(entity);
                }
            }

            this.entities.delete(entity.getVirtualId());
            this.aoi.remove(entity);
        }

        for (const entity of this.entities.values()) {
            if (entity instanceof Character) {
                entity.tick();
            }
        }
    }
}
