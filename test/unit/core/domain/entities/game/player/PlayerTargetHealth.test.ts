import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import NPC from '@/core/domain/entities/game/mob/NPC';
import Character from '@/core/domain/entities/game/Character';
import { PointsEnum } from '@/core/enum/PointsEnum';

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
                initialHp: 1000,
                initialMp: 50,
                initialStamina: 30,
                hpPerLvl: 0,
                hpPerHtPoint: 0,
                mpPerLvl: 0,
                mpPerIqPoint: 0,
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

const createPlayer = (virtualId: number, name: string, horseLevel?: number): Player =>
    PlayerFactory.create(
        {
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
            ...(horseLevel === undefined ? {} : { horseLevel, horseHealth: 1, horseStamina: 100, horseName: 'Pony' }),
        } as any,
        {
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
        },
    );

const createConnection = () => {
    const targetPackets: { virtualId: number; healthPercentage: number }[] = [];
    return {
        targetPackets,
        connection: {
            send: (packet: any) => {
                if (packet.constructor.name !== 'TargetUpdatedPacket') return;
                const buffer = packet.pack();
                targetPackets.push({
                    virtualId: buffer.readUInt32LE(1),
                    healthPercentage: buffer.readUInt8(5),
                });
            },
            setState: () => {},
        } as any,
    };
};

const createHorseNpc = (virtualId: number): NPC =>
    new NPC(
        {
            proto: { vnum: 20104, name: 'Brown Horse', empire: 0, rank: 'KING', type: 'NPC' },
            positionX: 0,
            positionY: 0,
            virtualId,
            direction: 0,
        } as any,
        {
            animationManager: { getAnimation: () => undefined } as any,
            questManager: { getQuestsByEvent: () => [] } as any,
            eventTimerManager: { addTimer: () => {}, removeTimer: () => {} } as any,
        },
    );

const createFakeArea = (horse: any) => ({
    spawned: [] as any[],
    spawnMob(this: any) {
        this.spawned.push(horse);
        return horse;
    },
    despawn: () => {},
});

const createMonsterLike = (virtualId: number, healthPercentage: number) =>
    ({
        getVirtualId: () => virtualId,
        getHealthPercentage: () => healthPercentage,
        addTargetedBy: () => {},
        removeTargetedBy: () => {},
    }) as unknown as Character;

describe('Player target health disclosure', () => {
    describe('sendTargetUpdated', () => {
        it('should report zero health for a player target', () => {
            const viewer = createPlayer(1, 'Viewer');
            const victim = createPlayer(2, 'Victim');
            const { connection, targetPackets } = createConnection();
            viewer.setConnection(connection);

            victim.addPoint(PointsEnum.HEALTH, -Math.floor(victim.getPoint(PointsEnum.MAX_HEALTH) * 0.75));

            // Guards against a vacuous assertion: the victim must really be on a
            // non-zero, non-full bar, so that sending 0 can only come from the fix.
            expect(victim.getHealthPercentage()).to.be.equal(25);

            viewer.setTarget(victim);

            expect(targetPackets).to.have.lengthOf(1);
            expect(targetPackets[0].virtualId).to.be.equal(2);
            expect(targetPackets[0].healthPercentage).to.be.equal(0);
        });

        it('should report the real health percentage for a non-player target', () => {
            const viewer = createPlayer(1, 'Viewer');
            const { connection, targetPackets } = createConnection();
            viewer.setConnection(connection);

            viewer.setTarget(createMonsterLike(77, 42));

            expect(targetPackets).to.have.lengthOf(1);
            expect(targetPackets[0].virtualId).to.be.equal(77);
            expect(targetPackets[0].healthPercentage).to.be.equal(42);
        });
    });

    describe('setTarget identity early-return', () => {
        it('should not answer again when the target did not change', () => {
            const viewer = createPlayer(1, 'Viewer');
            const { connection, targetPackets } = createConnection();
            viewer.setConnection(connection);

            const monster = createMonsterLike(77, 42);
            viewer.setTarget(monster);
            viewer.setTarget(monster);
            viewer.setTarget(monster);

            expect(targetPackets).to.have.lengthOf(1);
        });

        it('should still answer when the target changes', () => {
            const viewer = createPlayer(1, 'Viewer');
            const { connection, targetPackets } = createConnection();
            viewer.setConnection(connection);

            viewer.setTarget(createMonsterLike(77, 42));
            viewer.setTarget(createMonsterLike(88, 21));

            expect(targetPackets).to.have.lengthOf(2);
            expect(targetPackets[1].virtualId).to.be.equal(88);
            expect(targetPackets[1].healthPercentage).to.be.equal(21);
        });
    });

    describe('horse target health', () => {
        it('should report a full bar for an NPC with no owning rider', () => {
            expect(createHorseNpc(50).getHealthPercentage()).to.be.equal(100);
        });

        it('should report the rider horse health percentage', () => {
            const horse = createHorseNpc(50);

            horse.setHorseStats({ getHealth: () => 30, getMaxHealth: () => 200 });

            expect(horse.getHealthPercentage()).to.be.equal(15);
        });

        it('should report a full bar when the rider horse has no maximum health', () => {
            const horse = createHorseNpc(50);

            horse.setHorseStats({ getHealth: () => 0, getMaxHealth: () => 0 });

            expect(horse.getHealthPercentage()).to.be.equal(100);
        });

        it('should read the health of the horse it was summoned for', () => {
            const owner = createPlayer(2, 'Rider', 11);
            const horse = createHorseNpc(50);
            owner.setArea(createFakeArea(horse) as any);
            owner.setConnection(createConnection().connection);

            const maxHealth = owner.getHorseMaxHealth();
            owner.setHorseHealth(Math.floor(maxHealth / 2));

            expect(owner.summonHorse()).to.be.equal(true);
            expect(maxHealth).to.be.greaterThan(1);
            expect(horse.getHealthPercentage()).to.be.equal(50);

            owner.setHorseHealth(maxHealth);

            expect(horse.getHealthPercentage()).to.be.equal(100);
        });

        it('should reach the client through the target packet', () => {
            const viewer = createPlayer(1, 'Viewer');
            const { connection, targetPackets } = createConnection();
            viewer.setConnection(connection);

            const horse = createHorseNpc(50);
            horse.setHorseStats({ getHealth: () => 30, getMaxHealth: () => 200 });

            viewer.setTarget(horse);

            expect(targetPackets).to.have.lengthOf(1);
            expect(targetPackets[0].virtualId).to.be.equal(50);
            expect(targetPackets[0].healthPercentage).to.be.equal(15);
        });
    });
});
