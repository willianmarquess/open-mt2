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

const queue = new Queue(3);
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.dequeue();
queue.enqueue(4);
queue.enqueue(5);
console.log(queue.size()); //.to.equal(3);
console.log(queue.isFull()); //.to.be.true;
console.log(queue.front()); //.to.equal(2);
console.log(queue.rear()); //.to.equal(5);
