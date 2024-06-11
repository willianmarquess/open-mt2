import QuadTree from '../util/QuadTree.js';
import Queue from '../util/Queue.js';
import PlayerEventsEnum from './entities/player/events/PlayerEventsEnum.js';

const SIZE_QUEUE = 1000;
const CHAR_VIEW_SIZE = 10000;

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

    constructor({ name, positionX, positionY, width, height }) {
        this.#name = name;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#width = width;
        this.#height = height;
        this.#quadTree = new QuadTree(positionX, positionY, width * 25600, height * 25600, 20);
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

    spawn(entity) {
        this.#entitiesToSpawn.enqueue(entity);
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
                otherEntity.showOtherEntity(entity);
                entity.showOtherEntity(otherEntity);
            }

            this.#entities.set(entity.virtualId, entity);
        }

        for (const entity of this.#entitiesToDespawn.dequeueIterator()) {
            this.#entities.delete(entity.virtualId);
        }

        this.#entities.forEach((e) => e.tick());
    }
}
