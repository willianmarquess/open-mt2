import { expect } from 'chai';
import ItemManager from '@/core/domain/manager/ItemManager';
import ItemCache from '@/core/domain/util/ItemCache';

const state = (id: number) => ({ id }) as any;

const makeManager = (
    update: (item: any) => Promise<unknown>,
    remove: (item: any) => Promise<unknown> = async () => {},
) => {
    const itemCache = new ItemCache();
    const manager = new ItemManager({
        itemRepository: { update, delete: remove } as any,
        logger: { debug: () => {}, info: () => {}, error: () => {} } as any,
        config: {} as any,
        cacheProvider: {} as any,
    } as any);

    (manager as any).itemCache = itemCache;

    return { manager, itemCache };
};

describe('ItemManager.flush (issue #165)', () => {
    it('should keep a write queued during the await instead of discarding it', async () => {
        let resolveUpdate: () => void = () => {};
        const started = new Promise<void>((r) => (resolveUpdate = r));
        let queuedDuringAwait = false;

        const { manager, itemCache } = makeManager(async () => {
            if (!queuedDuringAwait) {
                queuedDuringAwait = true;
                itemCache.setToUpdate(1, state(99));
            }
            resolveUpdate();
        });

        itemCache.setToUpdate(1, state(10));

        await manager.flush(1);
        await started;

        const left = Array.from(itemCache.getItemsToUpdate(1)).map((item: any) => item.id);
        expect(left, 'the item queued while the DB write was in flight must survive').to.deep.equal([99]);
    });

    it('should write everything that was queued before the flush', async () => {
        const written: Array<number> = [];
        const { manager, itemCache } = makeManager(async (item) => {
            written.push(item.id);
        });

        itemCache.setToUpdate(1, state(10));
        itemCache.setToUpdate(1, state(11));

        await manager.flush(1);

        expect(written.sort()).to.deep.equal([10, 11]);
        expect(Array.from(itemCache.getItemsToUpdate(1)), 'the flushed entries are gone').to.have.lengthOf(0);
    });

    it('should put the entries back when the database write fails', async () => {
        const { manager, itemCache } = makeManager(async () => {
            throw new Error('db down');
        });

        itemCache.setToUpdate(1, state(10));

        let rejection: unknown = null;
        await manager.flush(1).catch((error) => (rejection = error));

        expect(rejection, 'the failure still propagates').to.be.instanceOf(Error);
        expect(
            Array.from(itemCache.getItemsToUpdate(1)).map((item: any) => item.id),
            'a failed flush must not lose the queued writes',
        ).to.deep.equal([10]);
    });

    it('should not resurrect an entry that was superseded while the write was failing', async () => {
        const itemCacheRef: { current: ItemCache | null } = { current: null };

        const { manager, itemCache } = makeManager(async () => {
            itemCacheRef.current!.setToDelete(1, state(10));
            throw new Error('db down');
        });
        itemCacheRef.current = itemCache;

        itemCache.setToUpdate(1, state(10));

        await manager.flush(1).catch(() => {});

        expect(
            Array.from(itemCache.getItemsToUpdate(1)),
            'the newer delete wins over the restored update',
        ).to.have.lengthOf(0);
        expect(Array.from(itemCache.getItemsToDelete(1)).map((item: any) => item.id)).to.deep.equal([10]);
    });

    it('should do nothing when there is nothing queued', async () => {
        let called = 0;
        const { manager } = makeManager(async () => {
            called++;
        });

        await manager.flush(1);

        expect(called).to.equal(0);
    });
});
