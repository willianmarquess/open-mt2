import { expect } from 'chai';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Player from '@/core/domain/entities/game/player/Player';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';

const logger: any = { info: () => {}, error: () => {}, debug: () => {} };

const START_X = 100_000;
const START_Y = 100_000;

const config: any = {
    empire: { red: { startPosX: 0, startPosY: 0 } },
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

// -accY / duration is the animation speed in units per second: a 450 u/s run.
// Without a run animation getMoveDistancePerMs() returns null and the whole
// rate check short-circuits, which would make these assertions vacuous.
const animationManager: any = {
    getAnimation: () => ({ getAccY: () => -450, getDuration: () => 1 }),
};

const createPlayer = (): Player => {
    const player = PlayerFactory.create(
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
            positionX: START_X,
            positionY: START_Y,
            name: 'Walker',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager,
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
    player.setConnection({ send: () => {}, setState: () => {} } as any);
    return player;
};

describe('Player move rate by movement type', () => {
    it('should not charge click destinations, so walking never rubber-bands', () => {
        const player = createPlayer();

        // The reported bug: clicking repeatedly while walking. Each MOVE packet
        // carries the whole remaining path, so charging them saturated the
        // window and then refused even a single step.
        const accepted = [];
        for (let i = 1; i <= 10; i++) {
            accepted.push(player.isMoveAllowed(START_X + i * 400, START_Y, MovementTypeEnum.MOVE));
        }

        expect(accepted.every(Boolean), 'every click was accepted').to.equal(true);
    });

    it('should still cap a single click beyond the per-packet limit', () => {
        const player = createPlayer();

        // Not charging the rate must not weaken the teleport cap.
        expect(player.isMoveAllowed(START_X + 5_000, START_Y, MovementTypeEnum.MOVE)).to.equal(false);
    });

    it('should still charge position claims, so hop-by-hop teleporting is refused', () => {
        const player = createPlayer();

        // WAIT relocates the character at once, so it is a claim about where
        // the character *is* and stays rate limited.
        let accepted = 0;
        for (let hop = 1; hop <= 30; hop++) {
            if (player.isMoveAllowed(START_X + hop * 180, START_Y, MovementTypeEnum.WAIT)) accepted++;
        }

        expect(accepted, 'the hop-by-hop burst was bounded').to.be.lessThan(30);
    });

    it('should charge position claims by default, for callers that pass no type', () => {
        const player = createPlayer();

        let accepted = 0;
        for (let hop = 1; hop <= 30; hop++) {
            if (player.isMoveAllowed(START_X + hop * 180, START_Y)) accepted++;
        }

        expect(accepted, 'the default is the conservative, charged path').to.be.lessThan(30);
    });
});
