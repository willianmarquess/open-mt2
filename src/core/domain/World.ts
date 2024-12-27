import Logger from '@/core/infra/logger/Logger';
import Grid from '../util/Grid';
import Area from './Area';
import Player from './entities/game/player/Player';
import GameServer from '@/game/interface/server/GameServer';
import GameEntity from './entities/game/GameEntity';
import { GameConfig } from '@/game/infra/config/GameConfig';
import SpawnManager from './manager/SpawnManager';
import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import { PrivilegeManager } from './manager/PrivilegeManager';

const TICKS_PER_SECONDS = 15;
const AREA_UNIT = 25600;

function calculateTickDelay(delta: number = 0) {
    const delay = 1000 / TICKS_PER_SECONDS - delta;
    return delay > 0 ? delay : 0;
}

const getAbsolutePosition = (pos: number) => (pos > AREA_UNIT ? Math.floor(pos / AREA_UNIT) : 0);

export default class World {
    private readonly players = new Map<string, Player>();
    private server: GameServer;
    private readonly logger: Logger;
    private readonly config: GameConfig;
    private readonly saveCharacterService: SaveCharacterService;
    private readonly spawnManager: SpawnManager;
    private readonly privilegeManager: PrivilegeManager;

    private virtualId = 0;

    private deltas = [];

    private readonly areas = new Map<string, Area>();
    private width = 0;
    private height = 0;
    private grid: Grid<Area>;

    constructor({ logger, config, saveCharacterService, spawnManager, privilegeManager }) {
        this.logger = logger;
        this.config = config;
        this.saveCharacterService = saveCharacterService;
        this.spawnManager = spawnManager;
        this.privilegeManager = privilegeManager;
    }

    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getGrid() {
        return this.grid;
    }

    generateVirtualId() {
        return ++this.virtualId;
    }

    getPlayers() {
        return this.players;
    }

    getAreas() {
        return this.areas;
    }

    getPlayerByName(name: string) {
        return this.players.get(name);
    }

    getAreaByName(name: string) {
        const areaByName = this.areas.get(name);
        if (!areaByName) {
            for (const area of this.areas.values()) {
                if (area.getAka() === name) {
                    return area;
                }
            }
        }

        return areaByName;
    }

    getEntityArea(entity: GameEntity) {
        const area = this.getArea(entity.getPositionX(), entity.getPositionY());

        if (!area) {
            this.logger.info(`[WORLD] Invalid location x: ${entity.getPositionX()}, y: ${entity.getPositionY()}`);
            return;
        }

        return area;
    }

    getAreaByCoordinates(x: number, y: number) {
        const area = this.getArea(x, y);

        if (!area) {
            this.logger.info(`[WORLD] Invalid location x: ${x}, y: ${y}`);
            return;
        }

        return area;
    }

    async load() {
        if (!this.config.atlas) {
            this.logger.info('[WORLD] No maps to load. Atlas configuration is missing.');
            return;
        }

        const maxDimensions = { maxWidth: 0, maxHeight: 0 };
        for (const { mapName, posX, posY, width, height, aka, goto } of this.config.atlas) {
            this.logger.info(
                `[WORLD] loading area: name: ${mapName}, posX: ${posX}, posY: ${posY}, width: ${width}, height: ${height}, sizeX: ${posX + width * AREA_UNIT}, sizeY: ${posY + height * AREA_UNIT}`,
            );
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
                    saveCharacterService: this.saveCharacterService,
                    logger: this.logger,
                    world: this,
                    spawnManager: this.spawnManager,
                },
            );
            await area.load();
            this.areas.set(mapName, area);
        }

        this.width = maxDimensions.maxWidth;
        this.height = maxDimensions.maxHeight;
        this.fillGrid();
    }

    fillGrid() {
        this.grid = new Grid(this.width / AREA_UNIT, this.height / AREA_UNIT);

        for (const area of this.areas.values()) {
            const realPositionX = getAbsolutePosition(area.getPositionX());
            const realPositionY = getAbsolutePosition(area.getPositionY());
            for (let x = realPositionX; x < realPositionX + area.getWidth(); x++) {
                for (let y = realPositionY; y < realPositionY + area.getHeight(); y++) {
                    this.grid.setValue(x, y, area);
                }
            }
        }
    }

    async init(server: GameServer) {
        this.server = server;
        await this.load();
        this.tick();
    }

    getArea(x: number, y: number) {
        const realPositionX = getAbsolutePosition(x);
        const realPositionY = getAbsolutePosition(y);
        return this.grid.getValue(realPositionX, realPositionY);
    }

    spawn(entity: GameEntity) {
        const area = this.getArea(entity.getPositionX(), entity.getPositionY());

        if (!area) {
            this.logger.info(`[WORLD] Invalid location x: ${entity.getPositionX()}, y: ${entity.getPositionY()}`);
            return;
        }

        if (entity instanceof Player) {
            this.players.set(entity.getName(), entity);
        }

        area.spawn(entity);
    }

    despawn(entity: GameEntity) {
        const area = this.getArea(entity.getPositionX(), entity.getPositionY());

        if (!area) {
            this.logger.info(`[WORLD] Invalid location x: ${entity.getPositionX()}, y: ${entity.getPositionY()}`);
            return;
        }

        if (entity instanceof Player) {
            this.players.delete(entity.getName());
        }

        area.despawn(entity);
    }

    async tick() {
        const startTickTime = performance.now();

        this.server.processMessages();

        for (const area of this.areas.values()) {
            area.tick();
        }

        this.privilegeManager.tick();

        this.server.sendPendingMessages();

        const delta = performance.now() - startTickTime;
        this.deltas.push(delta);

        if (this.deltas.length === 100) {
            const averageTick = this.deltas.reduce((acc, curr) => acc + curr, 0);
            this.logger.info(`average tick time is: ~${(averageTick / 100).toFixed(2)}ms`);
            this.deltas = [];
        }

        setTimeout(this.tick.bind(this), calculateTickDelay(delta));
        return Promise.resolve();
    }
}
