import EntityTypeEnum from '../enum/EntityTypeEnum.js';
import QuadTree from '../util/QuadTree.js';
import Queue from '../util/Queue.js';
import GameEntity from './entities/game/GameEntity.js';
import DroppedItem from './entities/game/item/DroppedItem.js';
import Player from './entities/game/player/Player.js';
import PlayerEventsEnum from './entities/game/player/events/PlayerEventsEnum.js';

const SIZE_QUEUE = 1000;
const CHAR_VIEW_SIZE = 10000;
const SAVE_PLAYERS_INTERVAL = 30000;
const REMOVE_ITEM_FROM_GROUND = 30000;

export default class Area {
    #name;
    #positionX;
    #positionY;
    #width;
    #height;
    #aka;
    #goto;

    #entities = new Map();
    #entitiesToSpawn = new Queue(SIZE_QUEUE);
    #entitiesToDespawn = new Queue(SIZE_QUEUE);
    #quadTree;

    #saveCharacterService;
    #logger;

    #world;

    constructor({ name, positionX, positionY, width, height, aka, goto }, { saveCharacterService, logger, world }) {
        this.#name = name;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#width = width;
        this.#height = height;
        this.#aka = aka;
        this.#goto = goto;
        this.#quadTree = new QuadTree(positionX, positionY, width * 25600, height * 25600, 20);

        this.#saveCharacterService = saveCharacterService;
        this.#logger = logger;

        this.#world = world;

        setInterval(this.#savePlayers.bind(this), SAVE_PLAYERS_INTERVAL);
    }

    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }
    get width() {
        return this.#width;
    }
    get height() {
        return this.#height;
    }
    get name() {
        return this.#name;
    }
    get aka() {
        return this.#aka;
    }
    get goto() {
        return this.#goto;
    }

    getEntity(virtualId) {
        return this.#entities.get(virtualId);
    }

    #onItemDrop(itemDropEvent) {
        const { item, count, positionX, positionY, ownerName } = itemDropEvent;
        const virtualId = this.#world.generateVirtualId();
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
            if (this.#entities.has(virtualId)) {
                this.despawn(droppedItem);
            }
        }, REMOVE_ITEM_FROM_GROUND);
    }

    async #savePlayers() {
        if (this.#entities.size < 1) return;

        const promises = [];

        for (const entity of this.#entities.values()) {
            if (entity instanceof Player) {
                this.#logger.debug(`[AREA] Saving player: ${entity.id}, ${entity.name}`);
                promises.push(this.#saveCharacterService.execute(entity));
            }
        }

        return Promise.all(promises).catch((error) =>
            this.#logger.error('[AREA] Error when try to save player: ', error),
        );
    }

    spawn(entity) {
        this.#entitiesToSpawn.enqueue(entity);
    }

    despawn(entity) {
        this.#entitiesToDespawn.enqueue(entity);
    }

    #onCharacterMove(characterMovedEvent) {
        const {
            entity,
            params: { positionX, positionY, arg, rotation, time, movementType, duration },
        } = characterMovedEvent;
        this.#quadTree.updatePosition(entity);
        const entities = this.#quadTree.queryAround(
            entity.positionX,
            entity.positionY,
            CHAR_VIEW_SIZE,
            EntityTypeEnum.PLAYER,
        );
        for (const otherEntity of entities) {
            if (otherEntity.name === entity.name) continue;
            otherEntity.updateOtherEntity({
                virtualId: entity.virtualId,
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

    #onCharacterLevelUp(characterLevelUpEvent) {
        const { entity } = characterLevelUpEvent;
        const entities = this.#quadTree.queryAround(
            entity.positionX,
            entity.positionY,
            CHAR_VIEW_SIZE,
            EntityTypeEnum.PLAYER,
        );
        for (const otherEntity of entities) {
            if (otherEntity.name === entity.name) continue;
            otherEntity.otherEntityLevelUp({ virtualId: entity.virtualId, level: entity.level });
        }
    }

    #onCharacterUpdate(characterUpdatedEvent) {
        const { vid, attackSpeed, moveSpeed, positionX, positionY, name, bodyId, weaponId, hairId } =
            characterUpdatedEvent;
        const entities = this.#quadTree.queryAround(positionX, positionY, CHAR_VIEW_SIZE, EntityTypeEnum.PLAYER);
        for (const otherEntity of entities) {
            if (otherEntity.name === name) continue;
            otherEntity.otherEntityUpdated({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId });
        }
    }

    tick() {
        for (const entity of this.#entitiesToSpawn.dequeueIterator()) {
            if (entity instanceof GameEntity) {
                entity.subscribe(PlayerEventsEnum.CHARACTER_MOVED, this.#onCharacterMove.bind(this));
                entity.subscribe(PlayerEventsEnum.CHARACTER_LEVEL_UP, this.#onCharacterLevelUp.bind(this));
                entity.subscribe(PlayerEventsEnum.CHARACTER_UPDATED, this.#onCharacterUpdate.bind(this));
                entity.subscribe(PlayerEventsEnum.DROP_ITEM, this.#onItemDrop.bind(this));
            }
            this.#quadTree.insert(entity);

            const entities = this.#quadTree.queryAround(
                entity.positionX,
                entity.positionY,
                CHAR_VIEW_SIZE,
                entity.entityType !== EntityTypeEnum.PLAYER ? EntityTypeEnum.PLAYER : null,
            );
            for (const otherEntity of entities) {
                if (otherEntity.name === entity.name) continue;
                if (entity instanceof GameEntity && otherEntity instanceof GameEntity) {
                    if (entity instanceof Player) {
                        entity.showOtherEntity({
                            virtualId: otherEntity.virtualId,
                            playerClass: otherEntity.playerClass,
                            entityType: otherEntity.entityType,
                            attackSpeed: otherEntity.attackSpeed,
                            movementSpeed: otherEntity.movementSpeed,
                            positionX: otherEntity.positionX,
                            positionY: otherEntity.positionY,
                            empireId: otherEntity.empireId,
                            level: otherEntity.level,
                            name: otherEntity.name,
                        });
                    }

                    otherEntity.showOtherEntity({
                        virtualId: entity.virtualId,
                        playerClass: entity.classId,
                        entityType: entity.entityType,
                        attackSpeed: entity.attackSpeed,
                        movementSpeed: entity.movementSpeed,
                        positionX: entity.positionX,
                        positionY: entity.positionY,
                        empireId: entity.empire,
                        level: entity.level,
                        name: entity.name,
                    });
                }

                if (entity instanceof DroppedItem && otherEntity instanceof Player) {
                    otherEntity.showDroppedItem({
                        virtualId: entity.virtualId,
                        count: entity.count,
                        ownerName: entity.ownerName,
                        positionX: entity.positionX,
                        positionY: entity.positionY,
                        id: entity.item.id,
                    });
                }

                if (entity instanceof Player && otherEntity instanceof DroppedItem) {
                    entity.showDroppedItem({
                        virtualId: otherEntity.virtualId,
                        count: otherEntity.count,
                        ownerName: otherEntity.ownerName,
                        positionX: otherEntity.positionX,
                        positionY: otherEntity.positionY,
                        id: otherEntity.item.id,
                    });
                }
            }

            this.#entities.set(entity.virtualId, entity);
        }

        for (const entity of this.#entitiesToDespawn.dequeueIterator()) {
            const entities = this.#quadTree.queryAround(
                entity.positionX,
                entity.positionY,
                CHAR_VIEW_SIZE,
                EntityTypeEnum.PLAYER,
            );
            for (const otherEntity of entities) {
                if (otherEntity.name === entity.name) continue;
                if (otherEntity instanceof Player && entity instanceof GameEntity) {
                    otherEntity.hideOtherEntity({ virtualId: entity.virtualId });
                }
                if (otherEntity instanceof Player && entity instanceof DroppedItem) {
                    otherEntity.hideDroppedItem({ virtualId: entity.virtualId });
                }
            }
            this.#entities.delete(entity.virtualId);
            this.#quadTree.remove(entity);
        }

        this.#entities.forEach((entity) => {
            if (entity instanceof GameEntity) {
                entity.tick();
            }
        });
    }
}
