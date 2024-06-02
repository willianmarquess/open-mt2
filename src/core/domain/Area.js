import Queue from '../util/Queue.js';

const SIZE_QUEUE = 1000;

export default class Area {
    #name;
    #positionX;
    #positionY;
    #width;
    #height;

    #entities = new Map();
    #entitiesToSpawn = new Queue(SIZE_QUEUE);
    #entitiesToDespawn = new Queue(SIZE_QUEUE);

    constructor({ name, positionX, positionY, width, height }) {
        this.#name = name;
        this.#positionX = positionX;
        this.#positionY = positionY;
        this.#width = width;
        this.#height = height;
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

    tick() {
        for (const entity of this.#entitiesToSpawn.dequeueIterator()) {
            //add entity
            this.#entities.set(entity.virtualId, entity);
        }

        for (const entity of this.#entitiesToDespawn.dequeueIterator()) {
            //remove entity
            this.#entities.delete(entity.virtualId);
        }

        this.#entities.forEach((e) => e.tick());
    }
}
