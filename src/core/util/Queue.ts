export default class Queue<T = any> {
    private readonly maxSize: number;
    private items: { [key: number]: T };
    private frontPos: number;
    private rearPos: number;
    private length: number;

    constructor(size = Number.MAX_SAFE_INTEGER) {
        this.maxSize = size;
        this.items = {} as { [key: number]: T };
        this.frontPos = 0;
        this.rearPos = -1;
        this.length = 0;
    }

    dequeue(): T | null {
        if (this.isEmpty()) return null;
        const dequeued = this.front();
        this.frontPos %= this.maxSize;
        delete this.items[this.frontPos];
        this.frontPos++;
        this.length--;
        return dequeued;
    }

    *dequeueIterator() {
        while (!this.isEmpty()) {
            yield this.dequeue();
        }
    }

    enqueue(item: T) {
        if (this.isFull()) return;
        this.rearPos++;
        this.length++;
        this.rearPos %= this.maxSize;
        this.items[this.rearPos] = item;
    }

    isFull() {
        return this.length >= this.maxSize;
    }

    isEmpty() {
        return this.length < 1;
    }

    rear(): T | null {
        return this.items[this.rearPos];
    }

    front() {
        if (this.isEmpty()) return null;
        return this.items[this.frontPos % this.maxSize];
    }

    size() {
        return this.length;
    }
}
