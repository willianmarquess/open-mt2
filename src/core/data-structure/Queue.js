export default class Queue {
    #maxSize;
    #items;
    #frontPos;
    #rearPos;

    constructor(size = Number.MAX_SAFE_INTEGER) {
        this.#maxSize = size;
        this.#items = {};
        this.#frontPos = 0;
        this.#rearPos = 0;
    }

    dequeue() {
        if (this.isEmpty()) return;
        const dequeued = this.front();
        delete this.#items[this.#frontPos++];
        return dequeued;
    }

    *dequeueIterator() {
        while (!this.isEmpty()) {
            yield this.dequeue();
        }
    }

    enqueue(item) {
        if (this.isFull()) return;
        this.#items[this.#rearPos++] = item;
    }

    isFull() {
        return this.size() === this.#maxSize;
    }

    isEmpty() {
        return this.size() < 1;
    }

    rear() {
        return this.#items[this.#rearPos - 1];
    }

    front() {
        return this.#items[this.#frontPos];
    }

    size() {
        return this.#rearPos - this.#frontPos;
    }
}
