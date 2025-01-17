import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import SpawnConfig from '../entities/game/mob/spawn/SpawnConfig';
import { Mob } from '../entities/game/mob/Mob';
import MonsterGroup from '../entities/game/mob/MonsterGroup';
import MathUtil from '../util/MathUtil';
import Monster from '../entities/game/mob/Monster';
import Logger from '@/core/infra/logger/Logger';
import MobManager from './MobManager';
import { GroupCollection, Groups } from '@/game/infra/config/GameConfig';
import { SpawnConfigTypeEnum } from '@/core/enum/SpawnConfigTypeEnum';

const DEFAULT_SPAWN_CONFIG_PATH = 'src/core/infra/config/data/spawn';

const spawnFiles = ['regen', 'npc', 'boss', 'stone'];

type SpawnFile = {
    type: string;
    x: string;
    y: string;
    rangeX: string;
    rangeY: string;
    z: string;
    direction: string;
    spawnTime: string;
    percent: string;
    count: string;
    vnum: string;
};

export default class SpawnManager {
    private readonly logger: Logger;
    private readonly mobManager: MobManager;
    private readonly groups: Array<Groups>;
    private readonly groupsCollection: Array<GroupCollection>;

    constructor({ logger, mobManager, config }) {
        this.logger = logger;
        this.mobManager = mobManager;
        this.groups = config.groups;
        this.groupsCollection = config.groupsCollection;
    }

    private createMonster({
        id,
        x,
        y,
        rangeX,
        rangeY,
        direction,
    }: {
        id: number;
        x: number;
        y: number;
        rangeX: number;
        rangeY: number;
        direction: number;
    }) {
        const realX = MathUtil.getRandomInt(Number(x) - Number(rangeX), Number(x) + Number(rangeX));
        const realY = MathUtil.getRandomInt(Number(y) - Number(rangeY), Number(y) + Number(rangeY));

        const monster = this.mobManager.getMob(Number(id), realX, realY, direction);
        return monster;
    }

    private createMonsters(spawn: SpawnConfig) {
        const entitiesToSpawn: Array<Mob> = [];
        const monsterGroup = new MonsterGroup({ spawnConfig: spawn });
        switch (spawn.getType()) {
            case SpawnConfigTypeEnum.MONSTER: {
                const entity = this.createMonster({
                    id: spawn.getId(),
                    x: spawn.getX(),
                    y: spawn.getY(),
                    direction: spawn.getDirection(),
                    rangeX: spawn.getRangeX(),
                    rangeY: spawn.getRangeY(),
                });
                if (entity && entity instanceof Monster) {
                    monsterGroup.addMember(entity);
                    entitiesToSpawn.push(entity);
                }
                break;
            }
            case SpawnConfigTypeEnum.GROUP_COLLECTION: {
                const groupCollectionConfig = this.groupsCollection.find((g) => Number(g.vnum) === spawn.getId());

                if (!groupCollectionConfig) {
                    this.logger.error(`[SpawnManager] group collection not found with vnum: ${spawn.getId()}`);
                    break;
                }

                const sortedIndex = MathUtil.getRandomInt(0, groupCollectionConfig.mobs.length - 1);

                const { vnum: groupVnum } = groupCollectionConfig.mobs[sortedIndex];

                const groupConfig = this.groups.find((g) => g.vnum === groupVnum);

                if (!groupConfig) {
                    this.logger.error(`[SpawnManager] group not found with vnum: ${groupVnum}`);
                    break;
                }
                const leader = this.createMonster({
                    id: Number(groupConfig.leaderVnum),
                    x: spawn.getX(),
                    y: spawn.getY(),
                    direction: spawn.getDirection(),
                    rangeX: spawn.getRangeX(),
                    rangeY: spawn.getRangeY(),
                });

                if (!leader) {
                    this.logger.error(`[SpawnManager] monster not found with vnum: ${groupConfig.leaderVnum}`);
                    break;
                }

                monsterGroup.setLeader(leader);
                entitiesToSpawn.push(leader);

                for (const monsterConfig of groupConfig.mobs) {
                    const monster = this.createMonster({
                        id: Number(monsterConfig.vnum),
                        x: spawn.getX(),
                        y: spawn.getY(),
                        direction: spawn.getDirection(),
                        rangeX: spawn.getRangeX(),
                        rangeY: spawn.getRangeY(),
                    });

                    if (monster instanceof Monster) {
                        entitiesToSpawn.push(monster);
                        monsterGroup.addMember(monster);
                    }
                }
                break;
            }
            case SpawnConfigTypeEnum.SPECIAL:
            case SpawnConfigTypeEnum.GROUP:
            default:
                this.logger.error('[SpawnManager] invalid spawn type', spawn.getType());
                break;
        }

        return entitiesToSpawn;
    }

    async getEntities(areaName: string) {
        const spawns = await this.loadFromArea(areaName);
        const entitiesToSpawn: Array<Mob> = [];

        for (const spawn of spawns.npc) {
            const entity = this.mobManager.getMob(spawn.getId(), spawn.getX(), spawn.getY(), spawn.getDirection());
            if (entity && entity instanceof Mob) {
                entitiesToSpawn.push(entity);
            }
        }

        for (const spawn of spawns.regen) {
            const entities = this.createMonsters(spawn);
            if (Array.isArray(entities)) {
                entitiesToSpawn.push(...entities);
            }
        }

        for (const spawn of spawns.boss) {
            const entities = this.createMonsters(spawn);
            if (Array.isArray(entities)) {
                entitiesToSpawn.push(...entities);
            }
        }

        for (const spawn of spawns.stone) {
            const entities = this.createMonsters(spawn);

            if (Array.isArray(entities)) {
                entitiesToSpawn.push(...entities);
            }
        }

        return entitiesToSpawn;
    }

    async loadFromArea(areaName: string) {
        const currentDir = process.cwd();

        const spawns = {
            regen: Array<SpawnConfig>(),
            npc: Array<SpawnConfig>(),
            boss: Array<SpawnConfig>(),
            stone: Array<SpawnConfig>(),
        };

        for (const file of spawnFiles) {
            const absoluteFilePath = path.join(currentDir, DEFAULT_SPAWN_CONFIG_PATH + `/${areaName}/${file}.json`);

            try {
                if (fsSync.existsSync(absoluteFilePath)) {
                    const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
                    const spawnsData: Array<SpawnFile> = JSON.parse(fileContent || '');

                    spawns[file] = spawnsData.map((spawnData) => {
                        return SpawnConfig.create({
                            type: spawnData.type,
                            x: Number(spawnData.x),
                            y: Number(spawnData.y),
                            rangeX: Number(spawnData.rangeX),
                            rangeY: Number(spawnData.rangeY),
                            direction: Number(spawnData.direction),
                            respawnTime: spawnData.spawnTime,
                            id: Number(spawnData.vnum),
                            count: Number(spawnData.count),
                        });
                    });
                }
            } catch (error) {
                this.logger.error(`Error loading spawn data from ${absoluteFilePath}:${error.message}`);
            }
        }

        return spawns;
    }
}
