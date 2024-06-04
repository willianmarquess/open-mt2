import Grid from '../util/Grid.js';
import Area from './Area.js';
import Player from './entities/player/Player.js';

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

    #virtualId = 0;

    #deltas = new Array();

    #areas = new Map();
    #width = 0;
    #height = 0;
    #grid;

    constructor({ server, logger, config }) {
        this.#server = server;
        this.#logger = logger;
        this.#config = config;
    }

    generateVirtualId() {
        return ++this.#virtualId;
    }

    get players() {
        return this.#players;
    }

    #load() {
        if (!this.#config.atlas) {
            this.#logger.warn('[WORLD] No maps to load. Atlas configuration is missing.');
            return;
        }

        const maxDimensions = { maxWidth: 0, maxHeight: 0 };
        this.#config.atlas?.forEach(({ mapName, posX, posY, width, height }) => {
            this.#logger.info(
                `[WORLD] loading map: name: ${mapName}, posX: ${posX}, posY: ${posY}, width: ${width}, height: ${height}, sizeX: ${posX + width * AREA_UNIT}, sizeY: ${posY + height * AREA_UNIT}`,
            );
            maxDimensions.maxWidth = Math.max(maxDimensions.maxWidth, posX + width * AREA_UNIT);
            maxDimensions.maxHeight = Math.max(maxDimensions.maxHeight, posY + height * AREA_UNIT);
            const area = new Area({
                name: mapName,
                positionX: posX,
                positionY: posY,
                width,
                height,
            });
            this.#areas.set(mapName, area);
        });

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

    async init() {
        this.#load();
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
            this.#players.set(entity.virtualId, entity);
        }

        area.spawn(entity);
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
            this.#logger.info(`average tick time is: ~${(averageTick / 100).toFixed(2)}ms`);
            this.#deltas = [];
        }

        setTimeout(this.#tick.bind(this), calculateTickDelay(delta));
        return Promise.resolve();
    }
}
