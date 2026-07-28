import World from '@/core/domain/World';
import Application from '../../core/app/Application';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import MobManager from '@/core/domain/manager/MobManager';
import ItemManager from '@/core/domain/manager/ItemManager';
import DropManager from '@/core/domain/manager/DropManager';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import CacheProvider from '@/core/infra/cache/CacheProvider';
import DatabaseManager from '@/core/infra/database/DatabaseManager';
import Server from '@/core/interface/server/Server';
import Logger from '@/core/infra/logger/Logger';
import ShopService from '@/game/app/service/ShopService';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class GameApplication extends Application {
    private readonly world: World;
    private readonly animationManager: AnimationManager;
    private readonly mobManager: MobManager;
    private readonly itemManager: ItemManager;
    private readonly dropManager: DropManager;
    private readonly questManager: QuestManager;
    private readonly shopService: ShopService;
    private readonly entityManager: EntityManager;

    constructor(container: {
        logger: Logger;
        server: Server;
        databaseManager: DatabaseManager;
        cacheProvider: CacheProvider;
        world: World;
        animationManager: AnimationManager;
        mobManager: MobManager;
        itemManager: ItemManager;
        dropManager: DropManager;
        questManager: QuestManager;
        shopService: ShopService;
        entityManager: EntityManager;
    }) {
        super(container);
        this.world = container.world;
        this.animationManager = container.animationManager;
        this.mobManager = container.mobManager;
        this.itemManager = container.itemManager;
        this.dropManager = container.dropManager;
        this.questManager = container.questManager;
        this.shopService = container.shopService;
        this.entityManager = container.entityManager;
    }

    async start() {
        this.logger.info('[APP] Init game application');
        this.itemManager.load();
        this.dropManager.load();
        await Promise.all([this.databaseManager.init(), this.cacheProvider.init(), this.animationManager.load()]);
        this.mobManager.load();
        this.questManager.load();
        this.shopService.load();
        this.entityManager.init();
        await this.server.setup().start();
        await this.world.init();
        this.logger.info('[APP] Game application started 🎮🚀');
    }

    async close() {
        this.logger.info('[APP] Closing game application... 🎮🛬');
        await this.server.close();
        await this.databaseManager.close();
        await this.cacheProvider.close();
    }
}
