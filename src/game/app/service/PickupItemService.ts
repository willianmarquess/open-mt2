import DroppedItem from '@/core/domain/entities/game/item/DroppedItem';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { IItemRepository } from '@/core/domain/repository/IItemRepository';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { EntityManager } from '@/core/domain/manager/EntityManager';

export default class PickupItemService {
    private readonly world: World;
    private readonly itemRepository: IItemRepository;
    private readonly entityManager: EntityManager;

    constructor({
        world,
        itemRepository,
        entityManager,
    }: {
        world: World;
        itemRepository: IItemRepository;
        entityManager: EntityManager;
    }) {
        this.world = world;
        this.itemRepository = itemRepository;
        this.entityManager = entityManager;
    }

    async execute(player: Player, virtualId: number) {
        const droppedItem = this.entityManager.getEntity<DroppedItem>(virtualId);

        if (!droppedItem) return;

        //TODO: validate id the dropped item is in the same map, and validate distance (avoid hacking)

        const item = droppedItem.getItem();
        const count = droppedItem.getCount();
        const ownerName = droppedItem.getOwnerName();

        const isGold = item.getId() === 1;

        if (isGold) {
            player.addPoint(PointsEnum.GOLD, Number(count));
            this.world.despawn(droppedItem);
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
            this.world.despawn(droppedItem);
            await this.itemRepository.create(item.toDatabase());
        }
    }
}
