import { expect } from 'chai';
import { EntityManager } from '@/core/domain/manager/EntityManager';
import { VirtualIdManager } from '@/core/domain/manager/VirtualIdManager';

const MONSTER_VNUM = 101;

const makeManager = () => {
    const virtualIdManager = new VirtualIdManager();
    const entityManager = new EntityManager({ virtualIdManager } as any);
    return { entityManager, virtualIdManager };
};

const makeMonster = (virtualId: number, vnum: number = MONSTER_VNUM) =>
    ({
        getVirtualId: () => virtualId,
        getId: () => vnum,
        isPlayer: () => false,
        isMob: () => true,
    }) as any;

const makePlayer = (virtualId: number, name: string = 'player') =>
    ({
        getVirtualId: () => virtualId,
        getId: () => 1,
        getName: () => name,
        isPlayer: () => true,
        isMob: () => false,
    }) as any;

const makeDroppedItem = (virtualId: number) =>
    ({
        getVirtualId: () => virtualId,
        getId: () => 10,
        isPlayer: () => false,
        isMob: () => false,
    }) as any;

describe('EntityManager entity removal (issues #164 and #126)', () => {
    it('should stop resolving a despawned monster by virtual id', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const monster = makeMonster(virtualIdManager.acquire());

        entityManager.addEntity(monster);
        entityManager.removeEntity(monster);

        expect(
            entityManager.getEntity(monster.getVirtualId()),
            'a resolvable despawned monster is what lets attack, on_click and pickup act on a corpse',
        ).to.be.undefined;
    });

    it('should drop a despawned monster from the vnum mapper so quest targets cannot point at it', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const monster = makeMonster(virtualIdManager.acquire());

        entityManager.addEntity(monster);
        entityManager.removeEntity(monster);

        expect(entityManager.getEntityByVnum(MONSTER_VNUM)).to.deep.equal([]);
    });

    it('should keep the other monsters of the same vnum resolvable', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const first = makeMonster(virtualIdManager.acquire());
        const second = makeMonster(virtualIdManager.acquire());

        entityManager.addEntity(first);
        entityManager.addEntity(second);
        entityManager.removeEntity(first);

        expect(entityManager.getEntityByVnum(MONSTER_VNUM)).to.deep.equal([second.getVirtualId()]);
        expect(entityManager.getEntity(second.getVirtualId())).to.be.equal(second);
    });

    it('should not accumulate duplicate virtual ids across despawn and respawn cycles', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const monster = makeMonster(virtualIdManager.acquire());

        entityManager.addEntity(monster);
        entityManager.removeEntity(monster);
        entityManager.addEntity(monster);
        entityManager.removeEntity(monster);
        entityManager.addEntity(monster);

        expect(
            entityManager.getEntityByVnum(MONSTER_VNUM),
            'every respawn used to push the same id again, growing the array forever',
        ).to.deep.equal([monster.getVirtualId()]);
    });

    it('should remove a player from the player map as it already did', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const player = makePlayer(virtualIdManager.acquire(), 'leaver');

        entityManager.addEntity(player);
        entityManager.removeEntity(player);

        expect(entityManager.getEntity(player.getVirtualId())).to.be.undefined;
        expect(entityManager.getPlayerByName('leaver')).to.be.null;
    });

    it('should release the virtual id of every removed entity', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const monster = makeMonster(virtualIdManager.acquire());
        const player = makePlayer(virtualIdManager.acquire());
        const droppedItem = makeDroppedItem(virtualIdManager.acquire());

        entityManager.addEntity(monster);
        entityManager.addEntity(player);
        entityManager.addEntity(droppedItem);
        entityManager.removeEntity(monster);
        entityManager.removeEntity(player);
        entityManager.removeEntity(droppedItem);

        expect(
            virtualIdManager.getActiveCount(),
            'an id kept acquired after removal is the leak of issue #126',
        ).to.be.equal(0);
    });

    it('should let a respawning monster re-enter with the virtual id it kept', () => {
        const { entityManager, virtualIdManager } = makeManager();
        const monster = makeMonster(virtualIdManager.acquire());

        entityManager.addEntity(monster);
        entityManager.removeEntity(monster);
        entityManager.addEntity(monster);

        expect(entityManager.getEntity(monster.getVirtualId())).to.be.equal(monster);
        expect(entityManager.getEntityByVnum(MONSTER_VNUM)).to.deep.equal([monster.getVirtualId()]);
    });
});
