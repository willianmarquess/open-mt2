export default class PickupItemService {
    #world;

    constructor({ world }) {
        this.#world = world;
    }

    async execute({ player, virtualId }) {
        const area = this.#world.getEntityArea(player);

        if (!area) return;

        const droppedItem = area.getEntity(virtualId);

        if (!droppedItem) return;

        if (player.pickup(droppedItem)) {
            area.despawn(droppedItem);
        }
    }
}
