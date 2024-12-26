import Logger from '@/core/infra/logger/Logger';
import { GameConfig, ItemProto } from '@/game/infra/config/GameConfig';
import ItemCache from '@/core/domain/util/ItemCache';
import Item from '@/core/domain/entities/game/item/Item';
import { IItemRepository } from '@/core/domain/repository/IItemRepository';

export default class ItemManager {
    private readonly config: GameConfig;
    private readonly items: Map<number, ItemProto> = new Map<number, ItemProto>();
    private readonly itemRepository: IItemRepository;
    private readonly logger: Logger;
    private readonly itemCache: ItemCache;

    constructor({ config, itemRepository, logger, itemCache }) {
        this.config = config;
        this.itemRepository = itemRepository;
        this.logger = logger;
        this.itemCache = itemCache;
    }

    load() {
        this.config.items.forEach((item) => {
            this.items.set(Number(item.vnum), item);
        });
    }

    hasItem(id) {
        return this.items.has(Number(id));
    }

    getItem(id: number, count: number = 1) {
        if (!this.hasItem(Number(id))) {
            return;
        }

        const proto = this.items.get(Number(id));

        return Item.create(proto, count);
    }

    async getItems(ownerId: number) {
        const items = await this.itemRepository.getByOwner(ownerId);

        return items.map((item) => {
            if (!this.hasItem(item.protoId)) {
                return;
            }

            const proto = this.items.get(item.protoId);

            return Item.fromDatabase({
                id: item.id,
                ownerId: item.ownerId,
                window: item.window,
                position: item.position,
                count: item.count,
                protoId: item.protoId,
                socket0: item.socket0,
                socket1: item.socket1,
                socket2: item.socket2,
                attributeType0: item.attributeType0,
                attributeValue0: item.attributeValue0,
                attributeType1: item.attributeType1,
                attributeValue1: item.attributeValue1,
                attributeType2: item.attributeType2,
                attributeValue2: item.attributeValue2,
                attributeType3: item.attributeType3,
                attributeValue3: item.attributeValue3,
                attributeType4: item.attributeType4,
                attributeValue4: item.attributeValue4,
                attributeType5: item.attributeType5,
                attributeValue5: item.attributeValue5,
                attributeType6: item.attributeType6,
                attributeValue6: item.attributeValue6,
                proto,
            });
        });
    }

    async update(item: Item) {
        const itemToDatabase = item.toDatabase();
        this.itemCache.setToUpdate(itemToDatabase.ownerId, itemToDatabase);
    }

    async delete(item: Item) {
        const itemToDatabase = item.toDatabase();
        this.itemCache.setToDelete(itemToDatabase.ownerId, itemToDatabase);
    }

    async flush(ownerId: number) {
        if (!this.itemCache.has(ownerId)) {
            return;
        }

        const itemsToUpdate = this.itemCache.getItemsToUpdate(ownerId);
        const itemsToDelete = this.itemCache.getItemsToDelete(ownerId);

        const updatePromises = Array.from(itemsToUpdate).map((item) => this.itemRepository.update(item));
        const deletePromises = Array.from(itemsToDelete).map((item) => this.itemRepository.delete(item));

        if (updatePromises.length === 0 && deletePromises.length === 0) return;

        await Promise.all([...updatePromises, ...deletePromises]);

        this.itemCache.clear(ownerId);

        this.logger.debug(`[ITEM MANAGER] Saving items of player id: ${ownerId}`);
    }
}
