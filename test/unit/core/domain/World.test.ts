import { expect } from 'chai';
import sinon from 'sinon';
import World from '@/core/domain/World';
import Logger from '@/core/infra/logger/Logger';

describe('World', () => {
    let clock: sinon.SinonFakeTimers;
    let logger: { info: sinon.SinonStub; error: sinon.SinonStub; debug: sinon.SinonStub };

    const createWorld = () => {
        return new World({
            logger: logger as unknown as Logger,
            config: {} as any,
            saveCharacterService: {} as any,
            spawnManager: {} as any,
            privilegeManager: { tick: sinon.stub() } as any,
            eventTimerManager: { tick: sinon.stub() } as any,
            entityManager: { tick: sinon.stub() } as any,
        });
    };

    const addArea = (world: World, area: { tick: () => void }) => {
        (world as any).areas.set('area', area);
    };

    beforeEach(() => {
        clock = sinon.useFakeTimers({ toFake: ['setTimeout'] });
        logger = { info: sinon.stub(), error: sinon.stub(), debug: sinon.stub() };
    });

    afterEach(() => {
        clock.restore();
        sinon.restore();
    });

    describe('tick', () => {
        it('should reschedule itself after a healthy tick', async () => {
            const world = createWorld();
            const area = { tick: sinon.stub() };
            addArea(world, area);

            await world.tick();

            expect(area.tick.calledOnce).to.be.true;
            expect(logger.error.called).to.be.false;
            expect(clock.countTimers(), 'the next tick is scheduled').to.equal(1);
        });

        it('should keep the loop alive when an area tick throws (issue #81)', async () => {
            const world = createWorld();
            addArea(world, {
                tick: () => {
                    throw new Error('broken entity');
                },
            });

            await world.tick();

            expect(logger.error.calledOnce, 'the failure is logged loudly').to.be.true;
            expect(clock.countTimers(), 'the next tick is still scheduled').to.equal(1);
        });

        it('should keep the loop alive when a manager tick throws (issue #81)', async () => {
            const world = createWorld();
            (world as any).entityManager.tick = () => {
                throw new Error('broken entity');
            };

            await world.tick();

            expect(logger.error.calledOnce).to.be.true;
            expect(clock.countTimers(), 'the next tick is still scheduled').to.equal(1);
        });

        it('should survive a persistently throwing area across consecutive ticks', async () => {
            const world = createWorld();
            addArea(world, {
                tick: () => {
                    throw new Error('broken entity');
                },
            });

            await world.tick();
            await clock.tickAsync(50);
            await clock.tickAsync(50);

            expect(logger.error.callCount, 'every failed tick is logged').to.be.at.least(3);
            expect(clock.countTimers(), 'the loop is still going').to.equal(1);
        });
    });
});
