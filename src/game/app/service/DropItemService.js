export default class DropItemService {
    async execute({ window, position, gold, count, player }) {
        player.dropItem({ window, position, gold, count });
    }
}
