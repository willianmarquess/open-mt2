import ChatMessageTypeEnum from '../../../core/enum/ChatMessageTypeEnum.js';

export default class PickupItemService {
    #world;
    #itemRepository;

    constructor({ world, itemRepository }) {
        this.#world = world;
        this.#itemRepository = itemRepository;
    }

    async execute({ player, virtualId }) {
        const area = this.#world.getEntityArea(player);

        if (!area) return;

        const droppedItem = area.getEntity(virtualId);

        if (!droppedItem) return;

        const { item, count, ownerName } = droppedItem;

        const isGold = item.id === 1;

        if (isGold) {
            player.addGold(Number(count));
            return;
        }

        const canPickup = ownerName === player.name || !ownerName;

        if (!canPickup) {
            player.say({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'This item is not yours',
            });
            return;
        }

        if (player.addItem(item)) {
            area.despawn(droppedItem);
            await this.#itemRepository.create(item.toDatabase());
        }
    }
}
