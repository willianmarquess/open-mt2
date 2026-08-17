import { expect } from 'chai';
import Area from '@/core/domain/Area';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

const createArea = () => {
    const logged: Array<string> = [];
    const spawned: Array<number> = [];
    const removed: Array<number> = [];

    const area = new Area(
        { name: 'test_area', positionX: 0, positionY: 0, width: 1, height: 1 },
        {
            spawnManager: {} as any,
            entityManager: {
                addEntity: (entity: any) => spawned.push(entity.getVirtualId()),
                removeEntity: (entity: any) => removed.push(entity.getVirtualId()),
            } as any,
            logger: {
                info: () => {},
                debug: () => {},
                error: (message: string) => logged.push(message),
            } as any,
        },
    );

    return { area, logged, spawned, removed };
};

const createEntity = (
    virtualId: number,
    hooks: { onSpawn?: () => Promise<void> | void; onDespawn?: () => Promise<void> | void } = {},
) => {
    const areas: Array<any> = [];
    let cell: any = null;
    return {
        areas,
        getVirtualId: () => virtualId,
        getPositionX: () => 1_000,
        getPositionY: () => 1_000,
        getTargetPosition: () => ({ x: 1_000, y: 1_000 }),
        getEntityType: () => EntityTypeEnum.MONSTER,
        setCell: (value: any) => (cell = value),
        getCell: () => cell,
        setArea: (area: any) => areas.push(area),
        addNearbyEntity: () => {},
        removeNearbyEntity: () => {},
        onSpawn: hooks.onSpawn ?? (() => {}),
        onDespawn: hooks.onDespawn ?? (() => {}),
    } as any;
};

describe('Area lifecycle queues (issue #124)', () => {
    const rejections: Array<unknown> = [];
    const onRejection = (reason: unknown) => rejections.push(reason);

    beforeEach(() => {
        rejections.length = 0;
        process.on('unhandledRejection', onRejection);
    });

    afterEach(() => {
        process.off('unhandledRejection', onRejection);
    });

    it('should keep a rejected onSpawn from escaping the tick', async () => {
        const { area, logged } = createArea();

        area.spawn(createEntity(1, { onSpawn: () => Promise.reject(new Error('quest boom')) }));
        area.tick();
        await flush();

        expect(rejections).to.have.length(0);
        expect(logged.some((message) => message.includes('quest boom'))).to.be.equal(true);
    });

    it('should keep a rejected onDespawn from escaping the tick', async () => {
        const { area, logged } = createArea();
        const entity = createEntity(1, { onDespawn: () => Promise.reject(new Error('save boom')) });

        area.spawn(entity);
        area.tick();
        area.despawn(entity);
        area.tick();
        await flush();

        expect(rejections).to.have.length(0);
        expect(logged.some((message) => message.includes('save boom'))).to.be.equal(true);
    });

    it('should keep draining the spawn queue when one entity throws synchronously', () => {
        const { area, spawned } = createArea();

        area.spawn(
            createEntity(1, {
                onSpawn: () => {
                    throw new Error('boom');
                },
            }),
        );
        area.spawn(createEntity(2));

        area.tick();

        expect(spawned).to.be.deep.equal([1, 2]);
    });

    it('should still place a healthy entity in the world', () => {
        const { area, spawned } = createArea();
        const entity = createEntity(1);

        area.spawn(entity);
        area.tick();

        expect(spawned).to.be.deep.equal([1]);
        expect(entity.areas).to.be.deep.equal([area]);
    });
});
