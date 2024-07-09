export default class DroppedItem {
    #item;
    #count;
    #ownerName;
    #virtualId;
    #positionX;
    #positionY;

    constructor({ item, count, ownerName, virtualId, positionX, positionY }) {
        this.#item = item;
        this.#count = count;
        this.#ownerName = ownerName;
        this.#virtualId = virtualId;
        this.#positionX = positionX;
        this.#positionY = positionY;
    }

    get item() {
        return this.#item;
    }
    get count() {
        return this.#count;
    }
    get ownerName() {
        return this.#ownerName;
    }
    get virtualId() {
        return this.#virtualId;
    }
    get positionX() {
        return this.#positionX;
    }
    get positionY() {
        return this.#positionY;
    }

    static create({ item, count, ownerName, virtualId, positionX, positionY }) {
        return new DroppedItem({
            item,
            count,
            ownerName,
            virtualId,
            positionX,
            positionY,
        });
    }
}
