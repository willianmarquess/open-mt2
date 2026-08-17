import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';

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

const createPlayer = (horseLevel = 11): Player =>
    PlayerFactory.create(
        {
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
            horseLevel,
            horseHealth: 200,
            horseStamina: 100,
            horseName: 'Pony',
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
                removeAllTimersFromOwner: () => {},
            } as any,
            mobManager: { getMobProto: () => undefined } as any,
        },
    );

const createKiller = () =>
    ({
        getVirtualId: () => 999,
        getName: () => 'Killer',
        removeTargetedBy: () => {},
        addTargetedBy: () => {},
    }) as unknown as Character;

const createConnection = () => ({ send: () => {}, setState: () => {} }) as any;

describe('Player dismount on death', () => {
    it('should dismount a riding character when it dies', () => {
        const player = createPlayer();
        player.setConnection(createConnection());

        expect(player.startRiding(), 'setup: the character mounted').to.equal(true);
        expect(player.isHorseRiding()).to.equal(true);

        player.die(createKiller());

        expect(player.isHorseRiding(), 'the corpse is no longer on the horse').to.equal(false);
        expect(player.getMountVnum(), 'the mount is cleared so re-renders carry no horse').to.equal(0);
    });

    it('should clear the mount of a rental ride too', () => {
        const player = createPlayer(0);
        player.setConnection(createConnection());

        expect(player.startTemporaryRiding(20115, 60_000), 'setup: the character mounted a rental').to.equal(true);
        expect(player.isHorseRiding()).to.equal(true);

        player.die(createKiller());

        expect(player.isHorseRiding()).to.equal(false);
        expect(player.getMountVnum()).to.equal(0);
    });

    it('should still die normally when not mounted', () => {
        const player = createPlayer();
        player.setConnection(createConnection());

        expect(player.isHorseRiding()).to.equal(false);

        player.die(createKiller());

        expect(player.isDead()).to.equal(true);
    });
});
