import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import QuadTree from '../util/QuadTree';
import Queue from '../util/Queue';
import GameEntity from './entities/game/GameEntity';
import DroppedItem from './entities/game/item/DroppedItem';
import Monster from './entities/game/mob/Monster';
import Player from './entities/game/player/Player';
import MathUtil from './util/MathUtil';
import Logger from '@/core/infra/logger/Logger';
import World from '@/core/domain/World';
import SpawnManager from '@/core/domain/manager/SpawnManager';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import Character from './entities/game/Character';
import CharacterMovedEvent from './entities/game/player/events/CharacterMovedEvent';
import CharacterLevelUpEvent from './entities/game/player/events/CharacterLevelUpEvent';
import CharacterUpdatedEvent from './entities/game/player/events/CharacterUpdatedEvent';
import MonsterMovedEvent from './entities/game/mob/events/MonsterMovedEvent';
import MonsterDiedEvent from './entities/game/mob/events/MonsterDiedEvent';
import DropItemEvent from './entities/game/player/events/DropItemEvent';

const SIZE_QUEUE = 5_000;
const CHAR_VIEW_SIZE = 9000;
const SAVE_PLAYERS_INTERVAL = 120000;
const REMOVE_ITEM_FROM_GROUND = 30000;
const SPAWN_POSITION_MULTIPLIER = 100;

export default class Area {
    private name: string;
    private positionX: number;
    private positionY: number;
    private width: number;
    private height: number;
    private aka: string;
    private goto: any;

    entities = new Map<number, GameEntity>();
    entitiesToSpawn = new Queue<GameEntity>(SIZE_QUEUE);
    entitiesToDespawn = new Queue<GameEntity>(SIZE_QUEUE);
    quadTree: QuadTree;

    saveCharacterService: SaveCharacterService;
    logger: Logger;

    world: World;
    spawnManager: SpawnManager;

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
        this.quadTree = new QuadTree(positionX, positionY, width * 25600, height * 25600, 50);

        this.saveCharacterService = saveCharacterService;
        this.logger = logger;

        this.world = world;
        this.spawnManager = spawnManager;

        setInterval(this.savePlayers.bind(this), SAVE_PLAYERS_INTERVAL);
    }

    async load() {
        const entitiesToSpawn = await this.spawnManager.getEntities(this.name);
        entitiesToSpawn.forEach((entity) => {
            entity.virtualId = this.world.generateVirtualId();
            entity.positionY = this.positionY + entity.positionY * SPAWN_POSITION_MULTIPLIER;
            entity.positionX = this.positionX + entity.positionX * SPAWN_POSITION_MULTIPLIER;
            entity.rotation = MathUtil.calcRotationFromDirection(entity.direction);
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

        return Promise.all(promises).catch((error) =>
            this.logger.error('[AREA] Error when try to save player: ', error),
        );
    }

    spawn(entity) {
        this.entitiesToSpawn.enqueue(entity);
    }

    despawn(entity) {
        this.entitiesToDespawn.enqueue(entity);
    }

    onMonsterDied(monsterDiedEvent: MonsterDiedEvent) {
        const { entity: monster } = monsterDiedEvent;
        const players = this.quadTree.queryAround(
            monster.getPositionX(),
            monster.getPositionY(),
            CHAR_VIEW_SIZE,
            EntityTypeEnum.PLAYER,
        ) as Map<number, Player>;

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
        this.quadTree.updatePosition(monster);
        const players = this.quadTree.queryAround(positionX, positionY, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<
            number,
            Player
        >;

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

        this.quadTree.updatePosition(entity);

        const entities = this.quadTree.queryAround(positionX, positionY, CHAR_VIEW_SIZE);

        for (const otherEntity of entities.values()) {
            if (otherEntity.getVirtualId() === entity.getVirtualId()) continue;

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
            } else {
                if (entity instanceof GameEntity) {
                    entity.addNearbyEntity(otherEntity);
                }

                if (otherEntity instanceof GameEntity) {
                    otherEntity.addNearbyEntity(entity);
                }
            }
        }

        for (const [virtualId, nearbyEntity] of entity.getNearbyEntities().entries()) {
            if (!entities.has(virtualId)) {
                if (entity instanceof GameEntity) {
                    entity.removeNearbyEntity(nearbyEntity);
                }

                if (nearbyEntity instanceof GameEntity) {
                    nearbyEntity.removeNearbyEntity(entity);
                }
            }
        }
    }

    onCharacterLevelUp(characterLevelUpEvent: CharacterLevelUpEvent) {
        const { entity } = characterLevelUpEvent;
        const entities = this.quadTree.queryAround(
            entity.getPositionX(),
            entity.getPositionY(),
            CHAR_VIEW_SIZE,
            EntityTypeEnum.PLAYER,
        ) as Map<number, Player>;
        for (const otherEntity of entities.values()) {
            if (otherEntity.getVirtualId() === entity.getVirtualId()) continue;

            otherEntity.otherEntityLevelUp({ virtualId: entity.getVirtualId(), level: entity.getLevel() });
        }
    }

    onCharacterUpdate(characterUpdatedEvent: CharacterUpdatedEvent) {
        const { vid, attackSpeed, moveSpeed, positionX, positionY, bodyId, weaponId, hairId } = characterUpdatedEvent;
        const entities = this.quadTree.queryAround(positionX, positionY, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER) as Map<
            number,
            Player
        >;
        for (const otherEntity of entities.values()) {
            if (otherEntity.getVirtualId() === vid) continue;
            otherEntity.otherEntityUpdated({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId });
        }
    }

    tick() {
        for (const entity of this.entitiesToSpawn.dequeueIterator()) {
            if (entity instanceof Player) {
                entity.subscribe(CharacterMovedEvent, this.onCharacterMove.bind(this));
                entity.subscribe(CharacterLevelUpEvent, this.onCharacterLevelUp.bind(this));
                entity.subscribe(DropItemEvent, this.onItemDrop.bind(this));
                entity.subscribe(CharacterUpdatedEvent, this.onCharacterUpdate.bind(this));
            }

            if (entity instanceof Monster) {
                entity.subscribe(MonsterMovedEvent, this.onMonsterMove.bind(this));
                entity.subscribe(MonsterDiedEvent, this.onMonsterDied.bind(this));
            }
            this.quadTree.insert(entity);

            const entities = this.quadTree.queryAround(
                entity.getPositionX(),
                entity.getPositionY(),
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
        }

        for (const entity of this.entitiesToDespawn.dequeueIterator()) {
            const entities = this.quadTree.queryAround(
                entity.getPositionX(),
                entity.getPositionY(),
                CHAR_VIEW_SIZE,
                EntityTypeEnum.PLAYER,
            );

            if (entity instanceof Player) {
                entity.removeAllListeners(CharacterMovedEvent);
                entity.removeAllListeners(CharacterLevelUpEvent);
                entity.removeAllListeners(DropItemEvent);
                entity.removeAllListeners(CharacterUpdatedEvent);
            }

            if (entity instanceof Monster) {
                entity.removeAllListeners(MonsterMovedEvent);
                entity.removeAllListeners(MonsterDiedEvent);
            }

            for (const otherEntity of entities.values()) {
                if (entity instanceof Character) {
                    entity.removeNearbyEntity(otherEntity);
                }

                if (otherEntity instanceof Character) {
                    otherEntity.removeNearbyEntity(entity);
                }
            }
            this.entities.delete(entity.getVirtualId());
            this.quadTree.remove(entity);
        }

        for (const entity of this.entities.values()) {
            if (entity instanceof Character) {
                entity.tick();
            }
        }
    }
}
