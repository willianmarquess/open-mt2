import { expect } from 'chai';
import PlayerFactory from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';

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

const createFactory = () =>
    new PlayerFactory({
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
        mobManager: { getMobProto: () => undefined } as any,
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

const createPlayer = (factory: PlayerFactory, virtualId: number, name: string, horse?: boolean): Player => {
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
        ...(horse ? { horseLevel: 11, horseHealth: 100, horseStamina: 100, horseName: 'Pony' } : {}),
    } as any);
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
});
