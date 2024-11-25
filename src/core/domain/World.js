import Grid from '../util/Grid.js';
import Area from './Area.js';
import Player from './entities/game/player/Player.js';

const TICKS_PER_SECONDS = 15;
const AREA_UNIT = 25600;

function calculateTickDelay(delta = 0) {
    const delay = 1000 / TICKS_PER_SECONDS - delta;
    return delay > 0 ? delay : 0;
}

const getAbsolutePosition = (pos) => (pos > AREA_UNIT ? Math.floor(pos / AREA_UNIT) : 0);

export default class World {
    #players = new Map();
    #server;
    #logger;
    #config;
    #saveCharacterService;
    #spawnManager;

    #virtualId = 0;

    #deltas = new Array();

    #areas = new Map();
    #width = 0;
    #height = 0;
    #grid;

    constructor({ logger, config, saveCharacterService, spawnManager }) {
        this.#logger = logger;
        this.#config = config;
        this.#saveCharacterService = saveCharacterService;
        this.#spawnManager = spawnManager;
    }

    generateVirtualId() {
        return ++this.#virtualId;
    }

    get players() {
        return this.#players;
    }

    get areas() {
        return this.#areas;
    }

    getPlayerByName(name) {
        return this.#players.get(name);
    }

    getAreaByName(name) {
        const areaByName = this.#areas.get(name);
        if (!areaByName) {
            for (const area of this.#areas.values()) {
                if (area.aka === name) {
                    return area;
                }
            }
        }

        return areaByName;
    }

    getEntityArea(entity) {
        const area = this.getArea(entity.positionX, entity.positionY);

        if (!area) {
            this.#logger.info(`[WORLD] Invalid location x: ${entity.positionX}, y: ${entity.positionY}`);
            return;
        }

        return area;
    }

    getAreaByCoordinates(x, y) {
        const area = this.getArea(x, y);

        if (!area) {
            this.#logger.info(`[WORLD] Invalid location x: ${x}, y: ${y}`);
            return;
        }

        return area;
    }

    async #load() {
        if (!this.#config.atlas) {
            this.#logger.warn('[WORLD] No maps to load. Atlas configuration is missing.');
            return;
        }

        const maxDimensions = { maxWidth: 0, maxHeight: 0 };
        for (const { mapName, posX, posY, width, height, aka, goto } of this.#config.atlas) {
            // this.#logger.info(
            //     `[WORLD] loading area: name: ${mapName}, posX: ${posX}, posY: ${posY}, width: ${width}, height: ${height}, sizeX: ${posX + width * AREA_UNIT}, sizeY: ${posY + height * AREA_UNIT}`,
            // );
            maxDimensions.maxWidth = Math.max(maxDimensions.maxWidth, posX + width * AREA_UNIT);
            maxDimensions.maxHeight = Math.max(maxDimensions.maxHeight, posY + height * AREA_UNIT);
            const area = new Area(
                {
                    name: mapName,
                    positionX: posX,
                    positionY: posY,
                    width,
                    height,
                    aka,
                    goto,
                },
                {
                    saveCharacterService: this.#saveCharacterService,
                    logger: this.#logger,
                    world: this,
                    spawnManager: this.#spawnManager,
                },
            );
            await area.load();
            this.#areas.set(mapName, area);
        }

        this.#width = maxDimensions.maxWidth;
        this.#height = maxDimensions.maxHeight;
        this.#fillGrid();
    }

    #fillGrid() {
        this.#grid = new Grid(this.#width / AREA_UNIT, this.#height / AREA_UNIT);

        for (const area of this.#areas.values()) {
            const realPositionX = getAbsolutePosition(area.positionX);
            const realPositionY = getAbsolutePosition(area.positionY);
            for (var x = realPositionX; x < realPositionX + area.width; x++) {
                for (var y = realPositionY; y < realPositionY + area.height; y++) {
                    this.#grid.setValue(x, y, area);
                }
            }
        }
    }

    async init(server) {
        this.#server = server;
        await this.#load();
        this.#tick();
    }

    getArea(x, y) {
        const realPositionX = getAbsolutePosition(x);
        const realPositionY = getAbsolutePosition(y);
        return this.#grid.getValue(realPositionX, realPositionY);
    }

    spawn(entity) {
        const area = this.getArea(entity.positionX, entity.positionY);

        if (!area) {
            this.#logger.info(`[WORLD] Invalid location x: ${entity.positionX}, y: ${entity.positionY}`);
            return;
        }

        if (entity instanceof Player) {
            this.#players.set(entity.name, entity);
        }

        area.spawn(entity);
    }

    despawn(entity) {
        const area = this.getArea(entity.positionX, entity.positionY);

        if (!area) {
            this.#logger.info(`[WORLD] Invalid location x: ${entity.positionX}, y: ${entity.positionY}`);
            return;
        }

        if (entity instanceof Player) {
            this.#players.delete(entity.name);
        }

        area.despawn(entity);
    }

    async #tick() {
        const startTickTime = performance.now();

        this.#server.processMessages();
        this.#areas.forEach((area) => area.tick());
        this.#server.sendPendingMessages();

        const delta = performance.now() - startTickTime;
        this.#deltas.push(delta);

        if (this.#deltas.length === 100) {
            const averageTick = this.#deltas.reduce((acc, curr) => acc + curr, 0);
            // this.#logger.info(`average tick time is: ~${(averageTick / 100).toFixed(2)}ms`);
            this.#deltas = [];
        }

        setTimeout(this.#tick.bind(this), calculateTickDelay(delta));
        return Promise.resolve();
    }
}
