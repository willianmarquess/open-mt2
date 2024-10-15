import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import SpawnConfig from '../entities/game/mob/spawn/SpawnConfig.js';
import Mob from '../entities/game/mob/Mob.js';

const DEFAULT_SPAWN_CONFIG_PATH = 'src/core/infra/config/data/spawn';

const spawnFiles = ['regen', 'npc', 'boss'];

export default class SpawnManager {
    #logger;
    #mobManager;

    constructor({ logger, mobManager }) {
        this.#logger = logger;
        this.#mobManager = mobManager;
    }

    async getEntities(areaName) {
        const spawns = await this.loadFromArea(areaName);

        const entitiesToSpawn = [];
        spawns.npc.forEach((spawn) => {
            const entity = this.#mobManager.getMob(spawn.id, spawn.x, spawn.y, spawn.direction);
            if (entity && entity instanceof Mob) {
                entitiesToSpawn.push(entity);
            }
        });

        spawns.regen.forEach((spawn) => {
            const entity = this.#mobManager.getMob(spawn.id, spawn.x, spawn.y, spawn.direction);
            if (entity && entity instanceof Mob) {
                entitiesToSpawn.push(entity);
            }
        });

        return entitiesToSpawn;
    }

    async loadFromArea(areaName) {
        const currentDir = process.cwd();

        const spawns = {
            regen: [],
            npc: [],
            boss: [],
        };

        for (const file of spawnFiles) {
            const absoluteFilePath = path.join(currentDir, DEFAULT_SPAWN_CONFIG_PATH + `/${areaName}/${file}.json`);

            try {
                if (fsSync.existsSync(absoluteFilePath)) {
                    const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
                    const spawnsData = JSON.parse(fileContent || '');

                    spawns[file] = spawnsData.map((spawnData) => {
                        return SpawnConfig.create({
                            type: spawnData.type,
                            x: spawnData.x,
                            y: spawnData.y,
                            rangeX: spawnData.rangeX,
                            rangeY: spawnData.rangeY,
                            direction: spawnData.direction,
                            respawnTime: spawnData.spawnTime,
                            id: spawnData.vnum,
                            count: spawnData.count,
                        });
                    });
                }
            } catch (error) {
                this.#logger.error(`Error loading spawn data from ${absoluteFilePath}:${error.message}`);
            }
        }

        return spawns;
    }
}
