import GameEntity from '@/core/domain/entities/game/GameEntity';
import QuadTree from '@/core/util/QuadTree';
import { expect } from 'chai';

const createFakeEntity = (id: number, x: number, y: number) => {
    return {
        getVirtualId: () => id,
        getPositionX: () => x,
        getPositionY: () => y,
    } as unknown as GameEntity;
};

describe('QuadTree', () => {
    it('should insert entities within its bounds', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = createFakeEntity(1, 5, 5);
        expect(qt.insert(entity)).to.be.true;
        expect(qt.getEntities()).to.include(entity);
    });

    it('should not insert entities outside its bounds', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = createFakeEntity(1, 15, 15);
        expect(qt.insert(entity)).to.be.false;
        expect(qt.getEntities()).to.not.include(entity);
    });

    it('should subdivide when capacity is reached', () => {
        const qt = new QuadTree(0, 0, 10, 10, 1);

        const entity1 = createFakeEntity(1, 2, 2);
        const entity2 = createFakeEntity(2, 3, 3);

        qt.insert(entity1);
        qt.insert(entity2);
        expect(qt.isSubdivided()).to.be.true;
    });

    it('should remove entities correctly', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        const entity = createFakeEntity(1, 5, 5);
        qt.insert(entity);
        expect(qt.remove(entity)).to.be.true;
        expect(qt.getEntities()).to.not.include(entity);
    });

    it('should query entities within a radius', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);

        const entity1 = createFakeEntity(1, 2, 2);
        const entity2 = createFakeEntity(2, 7, 7);

        qt.insert(entity1);
        qt.insert(entity2);
        const results = qt.queryAround(2, 2, 3);
        expect(Array.from(results.values())).to.include(entity1);
        expect(Array.from(results.values())).to.not.include(entity2);
    });

    it('should handle entity updates correctly', () => {
        const qt = new QuadTree(0, 0, 10, 10, 4);
        let entity = createFakeEntity(1, 2, 2);
        qt.insert(entity);
        entity = createFakeEntity(1, 2, 5);
        qt.updatePosition(entity);
        expect(qt.getEntities()).to.include(entity);
    });
});
