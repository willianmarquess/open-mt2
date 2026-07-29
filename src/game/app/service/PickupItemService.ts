import DroppedItem from '@/core/domain/entities/game/item/DroppedItem';
import Player from '@/core/domain/entities/game/player/Player';
import World from '@/core/domain/World';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { IItemRepository } from '@/core/domain/repository/IItemRepository';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import MathUtil from '@/core/domain/util/MathUtil';

const MAX_PICKUP_DISTANCE = 300;

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
        if (droppedItem.getArea() !== player.getArea()) return;

        const distance = MathUtil.calcDistance(
            player.getPositionX(),
            player.getPositionY(),
            droppedItem.getPositionX(),
            droppedItem.getPositionY(),
        );

        if (distance > MAX_PICKUP_DISTANCE) return;

        const item = droppedItem.getItem();
        const count = droppedItem.getCount();
        const ownerName = droppedItem.getOwnerName();

        const canPickup = ownerName === player.getName() || !ownerName;

        if (!canPickup) {
            player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: '[SYSTEM] This item is not yours',
            });
            return;
        }

        const isGold = item.getId() === 1;

        if (isGold) {
            player.addPoint(PointsEnum.GOLD, Number(count));
            this.world.despawn(droppedItem);
            return;
        }

        const added = player.addItemStacking(item);
        if (!added) return;

        this.world.despawn(droppedItem);

        for (const updated of added.updated) {
            await this.itemRepository.update(updated.toDatabase());
        }
        if (added.inserted) {
            const id = await this.itemRepository.create(added.inserted.toDatabase());
            added.inserted.setDbId(id);
        }
    }
}
