import { expect } from 'chai';
import Area from '@/core/domain/Area';
import Character from '@/core/domain/entities/game/Character';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';

const makeArea = () =>
    new Area(
        { name: 'test', positionX: 0, positionY: 0, width: 1, height: 1 },
        {
            spawnManager: { getSpawnPointsByAreaName: () => [] } as any,
            entityManager: { addEntity: () => {}, removeEntity: () => {} } as any,
        },
    );

const makeEntity = (virtualId: number, entityType: EntityTypeEnum, x = 100, y = 100) => {
    const nearby = new Map<number, any>();
    const entity: any = Object.create(Character.prototype);

    Object.assign(entity, {
        virtualId,
        positionX: x,
        positionY: y,
        getVirtualId: () => virtualId,
        getEntityType: () => entityType,
        getPositionX: () => x,
        getPositionY: () => y,
        addNearbyEntity: (other: any) => nearby.set(other.getVirtualId(), other),
        removeNearbyEntity: (other: any) => nearby.delete(other.getVirtualId()),
        getNearbyEntities: () => nearby,
        isNearby: (other: any) => nearby.has(other.getVirtualId()),
        onSpawn: () => {},
        onDespawn: () => {},
        isPlayer: () => entityType === EntityTypeEnum.PLAYER,
    });

    return entity;
};

describe('Area despawn unlinking (issue #168)', () => {
    it('should unlink a departing player from nearby monsters, not only from other players', () => {
        const area = makeArea();
        const monster = makeEntity(1, EntityTypeEnum.MONSTER);
        const player = makeEntity(2, EntityTypeEnum.PLAYER);

        area.spawn(monster);
        area.spawn(player);
        area.tick();

        expect(monster.getNearbyEntities().has(2), 'the monster sees the player while both are in').to.be.true;

        area.despawn(player);
        area.tick();

        expect(
            monster.getNearbyEntities().has(2),
            'a stale entry here is what lets findNextVictim re-acquire a phantom',
        ).to.be.false;
        expect(player.getNearbyEntities().has(1)).to.be.false;
    });

    it('should unlink a departing player from NPCs and stones, which never move to self-heal', () => {
        const area = makeArea();
        const npc = makeEntity(1, EntityTypeEnum.NPC);
        const stone = makeEntity(3, EntityTypeEnum.METIN_STONE);
        const player = makeEntity(2, EntityTypeEnum.PLAYER);

        area.spawn(npc);
        area.spawn(stone);
        area.spawn(player);
        area.tick();

        area.despawn(player);
        area.tick();

        expect(npc.getNearbyEntities().has(2), 'an NPC never fires onMonsterMove, so this would leak forever').to.be
            .false;
        expect(stone.getNearbyEntities().has(2)).to.be.false;
    });

    it('should still unlink a departing player from other players', () => {
        const area = makeArea();
        const other = makeEntity(1, EntityTypeEnum.PLAYER);
        const player = makeEntity(2, EntityTypeEnum.PLAYER);

        area.spawn(other);
        area.spawn(player);
        area.tick();

        area.despawn(player);
        area.tick();

        expect(other.getNearbyEntities().has(2)).to.be.false;
    });

    it('should keep a departing monster symmetric, which it already was', () => {
        const area = makeArea();
        const monster = makeEntity(1, EntityTypeEnum.MONSTER);
        const player = makeEntity(2, EntityTypeEnum.PLAYER);

        area.spawn(monster);
        area.spawn(player);
        area.tick();

        area.despawn(monster);
        area.tick();

        expect(player.getNearbyEntities().has(1)).to.be.false;
        expect(monster.getNearbyEntities().has(2)).to.be.false;
    });
});
