import { expect } from 'chai';
import Queue from '../../../../src/core/data-structure/Queue.js';

describe('Queue', () => {
    let queue;

    beforeEach(() => {
        queue = new Queue(3);
    });

    it('should enqueue items', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        expect(queue.size()).to.equal(3);
        expect(queue.isFull()).to.be.true;
    });

    it('should dequeue items', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        expect(queue.dequeue()).to.equal(1);
        expect(queue.size()).to.equal(2);
        expect(queue.isEmpty()).to.be.false;
    });

    it('should iterate over items using dequeueIterator', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        const iter = queue.dequeueIterator();
        expect(iter.next().value).to.equal(1);
        expect(iter.next().value).to.equal(2);
        expect(iter.next().value).to.equal(3);
        expect(iter.next().done).to.be.true;
    });
});
