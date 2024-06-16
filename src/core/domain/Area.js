import QuadTree from '../util/QuadTree.js';
import Queue from '../util/Queue.js';
import Player from './entities/game/player/Player.js';
import PlayerEventsEnum from './entities/game/player/events/PlayerEventsEnum.js';

const SIZE_QUEUE = 1000;
const CHAR_VIEW_SIZE = 10000;
const SAVE_PLAYERS_INTERVAL = 30000;

export default class Area {
    #name;
    #positionX;
    #positionY;
    #width;
    #height;

    #entities = new Map();
    #entitiesToSpawn = new Queue(SIZE_QUEUE);
    #entitiesToDespawn = new Queue(SIZE_QUEUE);
    #quadTree;

    #saveCharacterService;
    #logger;

    constructor({ name, positionX, positionY, width, height }, { saveCharacterService, logger }) {
        this.#name = name;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#width = width;
        this.#height = height;
        this.#quadTree = new QuadTree(positionX, positionY, width * 25600, height * 25600, 20);

        this.#saveCharacterService = saveCharacterService;
        this.#logger = logger;

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
        const entities = this.#quadTree.queryAround(entity.positionX, entity.positionY, CHAR_VIEW_SIZE);
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
        const entities = this.#quadTree.queryAround(entity.positionX, entity.positionY, CHAR_VIEW_SIZE);
        for (const otherEntity of entities) {
            if (otherEntity.name === entity.name) continue;
            otherEntity.otherEntityLevelUp({ virtualId: entity.virtualId, level: entity.level });
        }
    }

    tick() {
        for (const entity of this.#entitiesToSpawn.dequeueIterator()) {
            entity.subscribe(PlayerEventsEnum.CHARACTER_MOVED, this.#onCharacterMove.bind(this));
            entity.subscribe(PlayerEventsEnum.CHARACTER_LEVEL_UP, this.#onCharacterLevelUp.bind(this));
            this.#quadTree.insert(entity);

            const entities = this.#quadTree.queryAround(entity.positionX, entity.positionY, CHAR_VIEW_SIZE);
            for (const otherEntity of entities) {
                if (otherEntity.name === entity.name) continue;
                if (otherEntity instanceof Player) {
                    otherEntity.showOtherEntity({
                        virtualId: entity.virtualId,
                        playerClass: entity.playerClass,
                        entityType: entity.entityType,
                        attackSpeed: entity.attackSpeed,
                        movementSpeed: entity.movementSpeed,
                        positionX: entity.positionX,
                        positionY: entity.positionY,
                        empireId: entity.empireId,
                        level: entity.level,
                        name: entity.name,
                    });
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
            }

            this.#entities.set(entity.virtualId, entity);
        }

        for (const entity of this.#entitiesToDespawn.dequeueIterator()) {
            const entities = this.#quadTree.queryAround(entity.positionX, entity.positionY, CHAR_VIEW_SIZE);
            for (const otherEntity of entities) {
                if (otherEntity.name === entity.name) continue;
                if (otherEntity instanceof Player) {
                    otherEntity.hideOtherEntity({ virtualId: entity.virtualId });
                }
            }
            this.#entities.delete(entity.virtualId);
            this.#quadTree.remove(entity);
        }

        this.#entities.forEach((e) => e.tick());
    }
}
