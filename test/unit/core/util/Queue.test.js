import { expect } from 'chai';
import Queue from '../../../../src/core/util/Queue.js';

describe('CORE -> DATA STRUCTURE -> Queue', () => {
    context('when queue is empty', () => {
        let queue;

        beforeEach(() => {
            queue = new Queue();
        });

        it('should return true for isEmpty()', () => {
            expect(queue.isEmpty()).to.be.true;
        });

        it('should return false for isFull()', () => {
            expect(queue.isFull()).to.be.false;
        });

        it('should return undefined for front() and rear()', () => {
            expect(queue.front()).to.be.undefined;
            expect(queue.rear()).to.be.undefined;
        });

        it('should not dequeue items', () => {
            expect(queue.dequeue()).to.be.undefined;
        });
    });

    context('when queue is full', () => {
        let queue;

        beforeEach(() => {
            queue = new Queue(3);
            queue.enqueue(1);
            queue.enqueue(2);
            queue.enqueue(3);
        });

        it('should return false for isEmpty()', () => {
            expect(queue.isEmpty()).to.be.false;
        });

        it('should return true for isFull()', () => {
            expect(queue.isFull()).to.be.true;
        });

        it('should not enqueue items', () => {
            expect(queue.enqueue(4)).to.be.undefined;
            expect(queue.size()).to.equal(3);
        });
    });

    context('when queue is not empty', () => {
        let queue;

        beforeEach(() => {
            queue = new Queue();
            queue.enqueue(1);
            queue.enqueue(2);
            queue.enqueue(3);
        });

        it('should return false for isEmpty()', () => {
            expect(queue.isEmpty()).to.be.false;
        });

        it('should return correct size()', () => {
            expect(queue.size()).to.equal(3);
        });

        it('should dequeue items', () => {
            expect(queue.dequeue()).to.equal(1);
            expect(queue.size()).to.equal(2);
        });
    });
});
