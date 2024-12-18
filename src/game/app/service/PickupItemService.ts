import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import ItemRepository from '@/game/infra/database/ItemRepository';

export default class PickupItemService {
    private readonly world: World;
    private readonly itemRepository: ItemRepository;

    constructor({ world, itemRepository }) {
        this.world = world;
        this.itemRepository = itemRepository;
    }

    async execute(player: Player, virtualId: number) {
        const area = this.world.getEntityArea(player);

        if (!area) return;

        const droppedItem = area.getEntity(virtualId);

        if (!droppedItem) return;

        const { item, count, ownerName } = droppedItem;

        const isGold = item.id === 1;

        if (isGold) {
            player.addGold(Number(count));
            area.despawn(droppedItem);
            return;
        }

        const canPickup = ownerName === player.getName() || !ownerName;

        if (!canPickup) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'This item is not yours',
            });
            return;
        }

        if (player.addItem(item)) {
            area.despawn(droppedItem);
            await this.itemRepository.create(item.toDatabase());
        }
    }
}
