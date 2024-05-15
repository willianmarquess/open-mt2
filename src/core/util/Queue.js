export default class Queue {
    #maxSize;
    #items;
    #frontPos;
    #rearPos;
    #length;

    constructor(size = Number.MAX_SAFE_INTEGER) {
        this.#maxSize = size;
        this.#items = {};
        this.#frontPos = 0;
        this.#rearPos = -1;
        this.#length = 0;
    }

    dequeue() {
        if (this.isEmpty()) return;
        const dequeued = this.front();
        delete this.#items[(this.#frontPos %= this.#maxSize)];
        this.#frontPos++;
        this.#length--;
        return dequeued;
    }

    *dequeueIterator() {
        while (!this.isEmpty()) {
            yield this.dequeue();
        }
    }

    enqueue(item) {
        if (this.isFull()) return;
        this.#rearPos++;
        this.#length++;
        this.#items[(this.#rearPos %= this.#maxSize)] = item;
    }

    isFull() {
        return this.#length >= this.#maxSize;
    }

    isEmpty() {
        return this.#length < 1;
    }

    rear() {
        return this.#items[this.#rearPos];
    }

    front() {
        if (this.isEmpty()) return;
        return this.#items[this.#frontPos % this.#maxSize];
    }

    size() {
        return this.#length;
    }
}
