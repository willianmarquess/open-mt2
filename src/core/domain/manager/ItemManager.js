import Item from '../entities/game/item/Item.js';

export default class ItemManager {
    #config;
    #items = new Map();
    #itemRepository;
    #logger;
    #itemCache;

    constructor({ config, itemRepository, logger, itemCache }) {
        this.#config = config;
        this.#itemRepository = itemRepository;
        this.#logger = logger;
        this.#itemCache = itemCache;
    }

    load() {
        this.#config.items.forEach((item) => {
            this.#items.set(Number(item.vnum), item);
        });
    }

    hasItem(id) {
        return this.#items.has(Number(id));
    }

    getItem(id, count) {
        if (!this.hasItem(Number(id))) {
            return;
        }

        const proto = this.#items.get(Number(id));

        return Item.create(proto, count);
    }

    async getItems(ownerId) {
        const items = await this.#itemRepository.getByOwner(ownerId);

        return items.map((item) => {
            if (!this.hasItem(item.protoId)) {
                return;
            }

            const proto = this.#items.get(item.protoId);

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

    async update(item) {
        const itemToDatabase = item.toDatabase();
        this.#itemCache.setToUpdate(itemToDatabase.ownerId, itemToDatabase);
    }

    async delete(item) {
        const itemToDatabase = item.toDatabase();
        this.#itemCache.setToDelete(itemToDatabase.ownerId, itemToDatabase);
    }

    async flush(ownerId) {
        if (!this.#itemCache.has(ownerId)) {
            return;
        }

        const itemsToUpdate = this.#itemCache.getItemsToUpdate(ownerId);
        const itemsToDelete = this.#itemCache.getItemsToDelete(ownerId);

        const updatePromises = itemsToUpdate.map((item) => this.#itemRepository.update(item));
        const deletePromises = itemsToDelete.map((item) => this.#itemRepository.delete(item));

        if (updatePromises.length === 0 && deletePromises.length === 0) return;

        await Promise.all([...updatePromises, ...deletePromises]);

        this.#itemCache.clear();

        this.#logger.debug(`[ITEM MANAGER] Saving items of player id: ${ownerId}`);
    }
}
