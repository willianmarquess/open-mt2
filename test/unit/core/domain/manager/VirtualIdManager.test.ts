import { expect } from 'chai';
import { VirtualIdManager } from '@/core/domain/manager/VirtualIdManager';

describe('VirtualIdManager', () => {
    let manager: VirtualIdManager;

    beforeEach(() => {
        manager = new VirtualIdManager();
    });

    it('should hand out sequential ids starting at 1', () => {
        expect(manager.acquire()).to.be.equal(1);
        expect(manager.acquire()).to.be.equal(2);
        expect(manager.acquire()).to.be.equal(3);
    });

    it('should forget a released id instead of keeping it acquired forever (issue #126)', () => {
        const id = manager.acquire();

        expect(manager.release(id)).to.be.true;

        expect(manager.isAcquired(id), 'a released id kept in the set is the per-entity leak of issue #126').to.be
            .false;
        expect(manager.getActiveCount()).to.be.equal(0);
    });

    it('should never reissue a released id to a different entity', () => {
        const first = manager.acquire();
        manager.release(first);

        const second = manager.acquire();

        expect(second, 'a recycled id would let a stale client reference resolve to the wrong entity').to.not.be.equal(
            first,
        );
        expect(second).to.be.equal(first + 1);
    });

    it('should refuse to release an id it never handed out', () => {
        expect(manager.release(999)).to.be.false;
    });

    it('should refuse a double release', () => {
        const id = manager.acquire();

        expect(manager.release(id)).to.be.true;
        expect(manager.release(id)).to.be.false;
    });

    it('should keep counting past released ids', () => {
        manager.acquire();
        const second = manager.acquire();
        manager.release(second);

        manager.acquire();

        expect(manager.getTotalGenerated()).to.be.equal(3);
        expect(manager.getNextSequentialId()).to.be.equal(4);
        expect(manager.getActiveCount()).to.be.equal(2);
    });

    it('should start over after a clear', () => {
        manager.acquire();
        manager.acquire();

        manager.clear();

        expect(manager.acquire()).to.be.equal(1);
        expect(manager.getActiveCount()).to.be.equal(1);
    });
});
