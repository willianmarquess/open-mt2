import { expect } from 'chai';
import sinon from 'sinon';
import DroppedItem from '@/core/domain/entities/game/item/DroppedItem';
import Item from '@/core/domain/entities/game/item/Item';
import Player from '@/core/domain/entities/game/player/Player';
import GlobalEventTimerManager, { addTimerParam } from '@/core/domain/manager/GlobalEventTimeManager';

const OWNER = 'dropper';

function createDroppedItem(timers: Map<string, addTimerParam>) {
    const eventTimerManager = {
        addTimer: (params: addTimerParam) => timers.set(params.id, params),
        removeTimersByOwner: () => {},
        removeTimer: () => {},
        isTimerActive: () => false,
    } as unknown as GlobalEventTimerManager;

    return DroppedItem.create(
        {
            item: { getId: () => 27003 } as unknown as Item,
            count: 1,
            ownerName: OWNER,
            virtualId: 42,
            positionX: 100,
            positionY: 200,
        },
        { eventTimerManager },
    );
}

function createNearbyPlayer(virtualId: number) {
    const player = Object.create(Player.prototype);
    player.getVirtualId = () => virtualId;
    player.sendSetItemOwnership = sinon.spy();
    return player;
}

describe('DroppedItem ownership expiry (issue #98)', () => {
    it('should clear the ownership when the timer fires with nobody nearby', () => {
        const timers = new Map<string, addTimerParam>();
        const droppedItem = createDroppedItem(timers);

        droppedItem.onSpawn();
        timers.get('REMOVE_OWNER')!.eventFunction(1);

        expect(droppedItem.getOwnerName()).to.equal(null);
    });

    it('should clear the ownership and notify a nearby player', () => {
        const timers = new Map<string, addTimerParam>();
        const droppedItem = createDroppedItem(timers);
        const nearby = createNearbyPlayer(7);

        droppedItem.addNearbyEntity(nearby);
        droppedItem.onSpawn();
        timers.get('REMOVE_OWNER')!.eventFunction(1);

        expect(droppedItem.getOwnerName()).to.equal(null);
        expect(nearby.sendSetItemOwnership.calledOnce).to.equal(true);
        expect(nearby.sendSetItemOwnership.firstCall.args[0]).to.deep.equal({
            ownerName: '\0',
            virtualId: 42,
        });
    });

    it('should keep the ownership until the timer fires', () => {
        const timers = new Map<string, addTimerParam>();
        const droppedItem = createDroppedItem(timers);

        droppedItem.onSpawn();

        expect(droppedItem.getOwnerName()).to.equal(OWNER);
    });
});
