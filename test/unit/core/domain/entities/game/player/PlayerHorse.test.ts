import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import { PositionEnum } from '@/core/enum/PositionEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const config: any = {
    empire: { red: { startPosX: 100, startPosY: 200 } },
    jobs: {
        warrior: {
            common: {
                st: 10,
                ht: 10,
                dx: 10,
                iq: 10,
                initialHp: 100,
                initialMp: 50,
                initialStamina: 30,
                hpPerLvl: 10,
                hpPerHtPoint: 2,
                mpPerLvl: 5,
                mpPerIqPoint: 1,
                initialAttackSpeed: 100,
                initialMovementSpeed: 100,
                defensePerHtPoint: 1,
                attackPerDXPoint: 1,
                attackPerIQPoint: 1,
                attackPerStPoint: 1,
            },
        },
    },
};

const createFactoryDeps = (mobManager?: any) => ({
    config,
    animationManager: { getAnimation: () => undefined } as any,
    experienceManager: { getNeededExperience: () => 1000 } as any,
    logger,
    saveCharacterService: { execute: async () => {} } as any,
    questManager: { getQuestsByEvent: () => [], onKill: () => {} } as any,
    eventTimerManager: {
        addTimer: () => {},
        removeTimer: () => {},
        isTimerActive: () => false,
        clearTimersByOwner: () => {},
    } as any,
    mobManager: mobManager ?? ({ getMobProto: () => undefined } as any),
});

const createFactory = (mobManager?: any) => ({
    create: (params: any) => PlayerFactory.create(params, createFactoryDeps(mobManager)),
});

const createConnection = () => {
    const sentPackets: any[] = [];
    return {
        sentPackets,
        connection: {
            send: (packet: any) => {
                sentPackets.push({ name: packet.constructor.name, buffer: packet.pack() });
            },
            setState: () => {},
        } as any,
    };
};

const createPlayer = (
    factory: ReturnType<typeof createFactory>,
    virtualId: number,
    name: string,
    horse?: boolean,
    horseHealth: number = 100,
): Player => {
    return factory.create({
        playerClass: 0,
        accountId: virtualId,
        appearance: 0,
        slot: 0,
        virtualId,
        id: virtualId,
        empire: 1,
        skillGroup: 0,
        playTime: 0,
        level: 25,
        experience: 0,
        gold: 0,
        name,
        givenStatusPoints: 0,
        availableStatusPoints: 0,
        ...(horse ? { horseLevel: 11, horseHealth, horseStamina: 100, horseName: 'Pony' } : {}),
    } as any);
};

const createFakeHorse = (virtualId: number) => {
    let dead = false;
    let corpseOwnerVid: number | null = null;
    const nearby = new Map<number, any>();
    return {
        name: '',
        nearby,
        die: () => {
            dead = true;
        },
        isDead: () => dead,
        setCorpseOwnerVirtualId: (vid: number | null) => {
            corpseOwnerVid = vid;
        },
        getCorpseOwnerVirtualId: () => corpseOwnerVid,
        getVirtualId: () => virtualId,
        clearMovementNodes: () => {},
        continueMovementNodes: () => {},
        moveAlongNodes: () => {},
        setPoint: () => {},
        getState: () => 'IDLE',
        getPositionX: () => 0,
        getPositionY: () => 0,
        getNearbyEntities: () => nearby,
    };
};

const createFakeArea = (...horses: any[]) => {
    const despawned: any[] = [];
    const spawned: any[] = [];
    const queue = [...horses];
    return {
        despawned,
        spawned,
        spawnMob: () => {
            const horse = queue.shift();
            if (horse) spawned.push(horse);
            return horse;
        },
        despawn: (entity: any) => {
            despawned.push(entity);
        },
    };
};

describe('PlayerHorse', () => {
    describe('broadcastMountChange', () => {
        it('should broadcast riding state to self and nearby players without crashing', () => {
            const factory = createFactory();
            const rider = createPlayer(factory, 1, 'Rider', true);
            const watcher = createPlayer(factory, 2, 'Watcher');

            const riderConn = createConnection();
            const watcherConn = createConnection();
            rider.setConnection(riderConn.connection);
            watcher.setConnection(watcherConn.connection);

            rider.addNearbyEntity(watcher);
            watcher.addNearbyEntity(rider);

            const started = rider.startRiding();

            expect(started).to.be.equal(true);
            expect(rider.isHorseRiding()).to.be.equal(true);

            const watcherPacketNames = watcherConn.sentPackets.map((p) => p.name);
            expect(watcherPacketNames).to.include('CharacterSpawnPacket');
            expect(watcherPacketNames).to.include('CharacterInfoPacket');
        });

        it('should broadcast riding state to multiple nearby players', () => {
            const factory = createFactory();
            const rider = createPlayer(factory, 1, 'Rider', true);
            const watcherA = createPlayer(factory, 2, 'WatcherA');
            const watcherB = createPlayer(factory, 3, 'WatcherB');

            rider.setConnection(createConnection().connection);
            const watcherAConn = createConnection();
            const watcherBConn = createConnection();
            watcherA.setConnection(watcherAConn.connection);
            watcherB.setConnection(watcherBConn.connection);

            rider.addNearbyEntity(watcherA);
            rider.addNearbyEntity(watcherB);

            expect(rider.startRiding()).to.be.equal(true);

            for (const conn of [watcherAConn, watcherBConn]) {
                const names = conn.sentPackets.map((p) => p.name);
                expect(names).to.include('CharacterSpawnPacket');
                expect(names).to.include('CharacterInfoPacket');
            }
        });

        it('should broadcast dismount to nearby players', () => {
            const factory = createFactory();
            const rider = createPlayer(factory, 1, 'Rider', true);
            const watcher = createPlayer(factory, 2, 'Watcher');

            rider.setConnection(createConnection().connection);
            const watcherConn = createConnection();
            watcher.setConnection(watcherConn.connection);
            rider.addNearbyEntity(watcher);

            rider.startRiding();
            watcherConn.sentPackets.length = 0;

            expect(rider.stopRiding()).to.be.equal(true);
            expect(rider.isHorseRiding()).to.be.equal(false);

            const names = watcherConn.sentPackets.map((p) => p.name);
            expect(names).to.include('CharacterSpawnPacket');
        });
    });

    describe('dead horse', () => {
        it('should summon a dead horse as an alive, corpse-flagged entity (clickable for the owner)', () => {
            const horse = createFakeHorse(999);
            const factory = createFactory();
            const owner = createPlayer(factory, 1, 'Owner', true, 0);
            const area = createFakeArea(horse);
            const ownerConn = createConnection();
            owner.setConnection(ownerConn.connection);
            owner.setArea(area as any);

            expect(owner.summonHorse()).to.be.equal(true);

            expect(area.spawned).to.include(horse);
            // Alive server-side (picking filters dead actors client-side),
            // flagged so other viewers render it as a corpse.
            expect(horse.isDead()).to.be.equal(false);
            expect(horse.getCorpseOwnerVirtualId()).to.be.equal(1);
            // The owner sees a stun marker on it instead of the dead pose.
            expect(ownerConn.sentPackets.map((p) => p.name)).to.include('StunPacket');
        });

        it('should summon a living horse alive', () => {
            const horse = createFakeHorse(999);
            const factory = createFactory();
            const owner = createPlayer(factory, 1, 'Owner', true, 100);
            const area = createFakeArea(horse);
            owner.setConnection(createConnection().connection);
            owner.setArea(area as any);

            expect(owner.summonHorse()).to.be.equal(true);

            expect(area.spawned).to.include(horse);
            expect(horse.isDead()).to.be.equal(false);
        });

        it('should turn the spawned horse into a corpse and notify watchers when it dies', () => {
            const horse = createFakeHorse(999);
            const factory = createFactory();
            const owner = createPlayer(factory, 1, 'Owner', true, 100);
            const watcher = createPlayer(factory, 2, 'Watcher');
            const area = createFakeArea(horse);
            const ownerConn = createConnection();
            owner.setConnection(ownerConn.connection);
            const watcherConn = createConnection();
            watcher.setConnection(watcherConn.connection);
            owner.setArea(area as any);

            expect(owner.summonHorse()).to.be.equal(true);
            horse.nearby.set(2, watcher);

            owner.setHorseHealth(0);

            // Alive server-side but corpse-flagged: watchers get the death
            // packet (lying pose), the owner gets a stun marker and keeps the
            // entity clickable.
            expect(horse.isDead()).to.be.equal(false);
            expect(horse.getCorpseOwnerVirtualId()).to.be.equal(1);
            // The corpse stays in the area (no immediate despawn)
            expect(area.despawned).to.not.include(horse);
            expect(watcherConn.sentPackets.map((p) => p.name)).to.include('CharacterDiedPacket');
            expect(ownerConn.sentPackets.map((p) => p.name)).to.include('StunPacket');
            expect(ownerConn.sentPackets.map((p) => p.name)).to.not.include('CharacterDiedPacket');
        });

        it('should despawn the corpse and auto-mount on revive', () => {
            const corpse = createFakeHorse(999);
            const factory = createFactory();
            const owner = createPlayer(factory, 1, 'Owner', true, 0);
            const area = createFakeArea(corpse);
            owner.setConnection(createConnection().connection);
            owner.setArea(area as any);

            expect(owner.summonHorse()).to.be.equal(true);
            expect(corpse.getCorpseOwnerVirtualId()).to.be.equal(1);

            expect(owner.reviveHorse()).to.be.equal(true);

            expect(area.despawned).to.include(corpse);
            expect(owner.isHorseRiding()).to.be.equal(true);
            expect(owner.getHorseHealth()).to.be.greaterThan(0);
        });

        it('should remount on enter game when the player was riding at logout', () => {
            const factory = createFactory();
            const owner = factory.create({
                playerClass: 0,
                accountId: 1,
                appearance: 0,
                slot: 0,
                virtualId: 1,
                id: 1,
                empire: 1,
                skillGroup: 0,
                playTime: 0,
                level: 25,
                experience: 0,
                gold: 0,
                name: 'Rider',
                givenStatusPoints: 0,
                availableStatusPoints: 0,
                horseLevel: 11,
                horseHealth: 100,
                horseStamina: 100,
                horseName: 'Pony',
                horseRiding: 1,
            } as any);
            owner.setConnection(createConnection().connection);

            expect(owner.isHorseRiding()).to.be.equal(false);
            owner.restoreHorseRiding();
            expect(owner.isHorseRiding()).to.be.equal(true);

            // Restoring twice must not re-trigger anything
            owner.stopRiding();
            owner.restoreHorseRiding();
            expect(owner.isHorseRiding()).to.be.equal(false);
        });

        it('should send the death packet when a dead entity enters a player view', () => {
            const factory = createFactory();
            const watcher = createPlayer(factory, 1, 'Watcher');
            const deadPlayer = createPlayer(factory, 2, 'Ghost');
            const watcherConn = createConnection();
            watcher.setConnection(watcherConn.connection);

            deadPlayer.setPos(PositionEnum.DEAD);
            watcher.addNearbyEntity(deadPlayer);

            const names = watcherConn.sentPackets.map((p) => p.name);
            expect(names).to.include('CharacterSpawnPacket');
            expect(names).to.include('CharacterDiedPacket');
        });
    });
});
