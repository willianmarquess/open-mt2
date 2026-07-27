import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import GameEntity from '../entities/game/GameEntity';
import DroppedItem from '../entities/game/item/DroppedItem';
import Item from '../entities/game/item/Item';
import { Mob } from '../entities/game/mob/Mob';
import Player from '../entities/game/player/Player';
import { PlayerFactory } from '../factories/PlayerFactory';
import GlobalEventTimerManager from './GlobalEventTimeManager';
import MobManager from './MobManager';
import { VirtualIdManager } from './VirtualIdManager';
import Logger from '@/core/infra/logger/Logger';
import { GameConfig } from '@/game/infra/config/GameConfig';
import { QuestManager } from '../quests/QuestManager';
import AnimationManager from './AnimationManager';
import ExperienceManager from './ExperienceManager';

type VirtualId = number;
type Vnum = number;
const SAVE_PLAYERS_INTERVAL = 120000;

export class EntityManager {
    private readonly entities = new Map<VirtualId, GameEntity>();
    private readonly players = new Map<VirtualId, Player>();
    private readonly mobs = new Map<VirtualId, Mob>();
    private readonly vnumToVirtualIdMobMapper = new Map<Vnum, Array<VirtualId>>();

    private readonly mobManager: MobManager;
    private readonly virtualIdManager: VirtualIdManager;
    private readonly eventTimerManager: GlobalEventTimerManager;
    private readonly logger: Logger;
    private readonly saveCharacterService: SaveCharacterService;
    private readonly animationManager: AnimationManager;
    private readonly experienceManager: ExperienceManager;
    private readonly config: GameConfig;
    private readonly questManager: QuestManager;

    constructor({
        virtualIdManager,
        eventTimerManager,
        mobManager,
        logger,
        saveCharacterService,
        animationManager,
        config,
        experienceManager,
        questManager,
    }: {
        virtualIdManager: VirtualIdManager;
        eventTimerManager: GlobalEventTimerManager;
        mobManager: MobManager;
        saveCharacterService: SaveCharacterService;
        logger: Logger;
        animationManager: AnimationManager;
        experienceManager: ExperienceManager;
        config: GameConfig;
        questManager: QuestManager;
    }) {
        this.virtualIdManager = virtualIdManager;
        this.eventTimerManager = eventTimerManager;
        this.mobManager = mobManager;
        this.saveCharacterService = saveCharacterService;
        this.logger = logger;
        this.animationManager = animationManager;
        this.experienceManager = experienceManager;
        this.config = config;
        this.questManager = questManager;
    }

    init() {
        setInterval(async () => {
            if (this.players.size < 1) return;

            const promises: Array<Promise<PromiseSettledResult<unknown>[]>> = [];

            for (const entity of this.players.values()) {
                this.logger.debug(`[EntityManager] Saving player: ${entity.getId()}, ${entity.getName()}`);
                promises.push(this.saveCharacterService.execute(entity));
            }

            await Promise.allSettled(promises).catch((error) =>
                this.logger.error('[EntityManager] Error when try to save player: ', error),
            );
        }, SAVE_PLAYERS_INTERVAL);
    }

    addEntity(entity: GameEntity): void {
        if (entity.isPlayer()) {
            this.players.set(entity.getVirtualId(), entity);
        }

        if (entity.isMob()) {
            this.mobs.set(entity.getVirtualId(), entity);
            const mobsVirtualId = this.vnumToVirtualIdMobMapper.get(entity.getId());
            mobsVirtualId?.push(entity.getVirtualId());
            this.vnumToVirtualIdMobMapper.set(entity.getId(), mobsVirtualId || [entity.getVirtualId()]);
        }

        this.entities.set(entity.getVirtualId(), entity);
    }

    removeEntity(entity: GameEntity) {
        if (entity.isMob()) return;

        if (entity.isPlayer()) {
            this.players.delete(entity.getVirtualId());
        }

        this.entities.delete(entity.getVirtualId());
    }

    createMob(info: { id: number; positionX: number; positionY: number; direction?: number }) {
        const virtualId = this.virtualIdManager.acquire();
        return this.mobManager.getMob({ ...info, virtualId });
    }

    createPlayer(info: {
        playerClass: number;
        accountId: number;
        appearance?: number;
        slot: number;
        id?: number;
        empire: number;
        skillGroup?: number;
        playTime?: number;
        level?: number;
        experience?: number;
        gold?: number;
        st?: number;
        ht?: number;
        dx?: number;
        iq?: number;
        positionX?: number;
        positionY?: number;
        health?: number;
        mana?: number;
        stamina?: number;
        bodyPart?: number;
        hairPart?: number;
        name: string;
        givenStatusPoints?: number;
        availableStatusPoints?: number;
        quickSlot?: Map<number, { type: number; position: number }>;
    }): Player {
        const virtualId = this.virtualIdManager.acquire();
        const player = PlayerFactory.create(
            {
                ...info,
                virtualId,
            },
            {
                config: this.config,
                animationManager: this.animationManager,
                eventTimerManager: this.eventTimerManager,
                experienceManager: this.experienceManager,
                logger: this.logger,
                mobManager: this.mobManager,
                questManager: this.questManager,
                saveCharacterService: this.saveCharacterService,
            },
        );
        return player;
    }

    createDroppedItem(info: {
        item: Item;
        count: number;
        positionX: number;
        positionY: number;
        ownerName: string;
    }): DroppedItem {
        const { item, count, positionX, positionY, ownerName } = info;
        const virtualId = this.virtualIdManager.acquire();
        const droppedItem = DroppedItem.create(
            {
                item,
                count,
                ownerName,
                virtualId,
                positionX,
                positionY,
            },
            {
                eventTimerManager: this.eventTimerManager,
            },
        );
        return droppedItem;
    }

    getEntity<T extends GameEntity>(virtualId: VirtualId): T {
        return this.entities.get(virtualId) as T;
    }

    getEntityByVnum(vnum: Vnum): Array<number> {
        return this.vnumToVirtualIdMobMapper.get(vnum) ?? [];
    }

    tick() {
        for (const entity of this.entities.values()) {
            entity.tick();
        }
    }
}
