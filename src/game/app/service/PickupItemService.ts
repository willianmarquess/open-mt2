import DroppedItem from '@/core/domain/entities/game/item/DroppedItem';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { IItemRepository } from '@/core/domain/repository/IItemRepository';
import { PointsEnum } from '@/core/enum/PointsEnum';

export default class PickupItemService {
    private readonly world: World;
    private readonly itemRepository: IItemRepository;

    constructor({ world, itemRepository }) {
        this.world = world;
        this.itemRepository = itemRepository;
    }

    async execute(player: Player, virtualId: number) {
        const area = this.world.getEntityArea(player);

        if (!area) return;

        const droppedItem = area.getEntity(virtualId) as unknown as DroppedItem;

        if (!droppedItem) return;

        const item = droppedItem.getItem();
        const count = droppedItem.getCount();
        const ownerName = droppedItem.getOwnerName();

        const isGold = item.getId() === 1;

        if (isGold) {
            player.addPoint(PointsEnum.GOLD, Number(count));
            area.despawn(droppedItem);
            return;
        }

        const canPickup = ownerName === player.getName() || !ownerName;

        if (!canPickup) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] This item is not yours',
            });
            return;
        }

        if (player.addItem(item)) {
            area.despawn(droppedItem);
            await this.itemRepository.create(item.toDatabase());
        }
    }
}
