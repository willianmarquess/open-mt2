import { expect } from 'chai';
import QuadTree from '../../../../src/core/util/QuadTree.js';

describe('QuadTree', () => {
    it('should insert entities within its bounds', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = { virtualId: 1, positionX: 5, positionY: 5 };
        expect(qt.insert(entity)).to.be.true;
        expect(qt.entities).to.include(entity);
    });

    it('should not insert entities outside its bounds', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = { virtualId: 1, positionX: 15, positionY: 15 };
        expect(qt.insert(entity)).to.be.false;
        expect(qt.entities).to.not.include(entity);
    });

    it('should subdivide when capacity is reached', () => {
        const qt = new QuadTree(0, 0, 10, 10, 1);
        const entity1 = { virtualId: 1, positionX: 2, positionY: 2 };
        const entity2 = { virtualId: 2, positionX: 3, positionY: 3 };
        qt.insert(entity1);
        qt.insert(entity2);
        expect(qt.subdivided).to.be.true;
    });

    it('should remove entities correctly', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = { virtualId: 1, positionX: 5, positionY: 5 };
        qt.insert(entity);
        expect(qt.remove(entity)).to.be.true;
        expect(qt.entities).to.not.include(entity);
    });

    it('should query entities within a radius', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity1 = { virtualId: 1, positionX: 2, positionY: 2 };
        const entity2 = { virtualId: 2, positionX: 7, positionY: 7 };
        qt.insert(entity1);
        qt.insert(entity2);
        const results = qt.queryAround(2, 2, 3);
        expect(Array.from(results.values())).to.include(entity1);
        expect(Array.from(results.values())).to.not.include(entity2);
    });

    it('should handle entity updates correctly', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = { virtualId: 1, positionX: 2, positionY: 2 };
        qt.insert(entity);
        entity.positionX = 5;
        qt.updatePosition(entity);
        expect(qt.entities).to.include(entity);
    });
});
