import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import SpawnConfig from '../entities/game/mob/spawn/SpawnConfig.js';
import Mob from '../entities/game/mob/Mob.js';
import SpawnConfigTypeEnum from '../../enum/SpawnConfigTypeEnum.js';
import MonsterGroup from '../entities/game/mob/MonsterGroup.js';
import MathUtil from '../util/MathUtil.js';

const DEFAULT_SPAWN_CONFIG_PATH = 'src/core/infra/config/data/spawn';

const spawnFiles = ['regen', 'npc', 'boss'];

export default class SpawnManager {
    #logger;
    #mobManager;
    #groups;
    #groupsCollection;

    constructor({ logger, mobManager, config }) {
        this.#logger = logger;
        this.#mobManager = mobManager;
        this.#groups = config.groups;
        this.#groupsCollection = config.groupsCollection;
    }

    #createMonster({ id, x, y, rangeX, rangeY, direction }) {
        const realX = MathUtil.getRandomInt(Number(x) - Number(rangeX), Number(x) + Number(rangeX));
        const realY = MathUtil.getRandomInt(Number(y) - Number(rangeY), Number(y) + Number(rangeY));

        const monster = this.#mobManager.getMob(id, realX, realY, direction);
        return monster;
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
            switch (spawn.type) {
                case SpawnConfigTypeEnum.MONSTER: {
                    const entity = this.#mobManager.getMob(spawn.id, spawn.x, spawn.y, spawn.direction);
                    if (entity && entity instanceof Mob) {
                        entitiesToSpawn.push(entity);
                    }
                    break;
                }
                case SpawnConfigTypeEnum.GROUP:
                    break;
                case SpawnConfigTypeEnum.GROUP_COLLECTION: {
                    const groupCollectionConfig = this.#groupsCollection.find((g) => g.vnum === spawn.id);

                    if (!groupCollectionConfig) {
                        this.#logger.error(`[SpawnManager] group collection not found with vnum: ${spawn.id}`);
                        return;
                    }

                    for (const { vnum: groupVnum, count } of groupCollectionConfig.mobs) {
                        const groupConfig = this.#groups.find((g) => g.vnum === groupVnum);

                        if (!groupConfig) {
                            this.#logger.error(`[SpawnManager] group not found with vnum: ${groupVnum}`);
                            continue;
                        }

                        for (let i = 0; i < count; i++) {
                            const leader = this.#createMonster({
                                id: groupConfig.leaderVnum,
                                x: spawn.x,
                                y: spawn.y,
                                direction: spawn.direction,
                                rangeX: spawn.rangeX,
                                rangeY: spawn.rangeY,
                            });

                            if (!leader) {
                                this.#logger.error(
                                    `[SpawnManager] monster not found with vnum: ${groupConfig.leaderVnum}`,
                                );
                                continue;
                            }

                            const monsterGroup = new MonsterGroup({
                                vnum: groupVnum,
                                leader: leader,
                            });

                            entitiesToSpawn.push(leader);

                            for (const monsterConfig of groupConfig.mobs) {
                                const monster = this.#createMonster({
                                    id: monsterConfig.vnum,
                                    x: spawn.x,
                                    y: spawn.y,
                                    direction: spawn.direction,
                                    rangeX: spawn.rangeX,
                                    rangeY: spawn.rangeY,
                                });

                                if (monster && monster instanceof Mob) {
                                    entitiesToSpawn.push(monster);
                                    monsterGroup.addMember(monster);
                                }
                            }
                        }
                    }
                    break;
                }
                case SpawnConfigTypeEnum.SPECIAL:
                    break;
                default:
                    this.#logger.error('[SpawnManager] invalid spawn type', spawn.type);
                    break;
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
