import { expect } from 'chai';
import sinon from 'sinon';
import Animation from '@/core/domain/Animation';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import { PointsEnum } from '@/core/enum/PointsEnum';
import Logger from '@/core/infra/logger/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} };

// A player run animation: 450 map units per second at movement speed 100.
const RUN_ANIMATION = new Animation({ duration: 1, accX: 0, accY: -450, accZ: 0 });
const MOVE_SPEED = 100;

const MOVE_WINDOW_MS = 1_000;
const MOVE_DISTANCE_TOLERANCE = 2;

const START_X = 100_000;
const START_Y = 100_000;

const createPlayer = ({ animation }: { animation?: Animation } = { animation: RUN_ANIMATION }) => {
    const config: any = {
        empire: { red: { startPosX: 0, startPosY: 0 } },
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
                },
            },
        },
    };

    const player = PlayerFactory.create(
        {
            playerClass: 0,
            accountId: 1,
            appearance: 1,
            slot: 0,
            virtualId: 1,
            id: 1,
            empire: 1,
            skillGroup: 0,
            playTime: 0,
            level: 1,
            experience: 0,
            gold: 0,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            positionX: START_X,
            positionY: START_Y,
            health: 100,
            mana: 50,
            stamina: 30,
            bodyPart: 0,
            hairPart: 0,
            name: 'mover',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager: { getAnimation: () => animation } as any,
            experienceManager: { getNeededExperience: () => 100 } as any,
            logger,
            saveCharacterService: {} as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
            mobManager: {} as any,
        },
    );

    // The factory only stores the base speed; the live point is filled in by
    // Player.init() on login, which needs far more of the world than this test.
    player.addPoint(PointsEnum.MOVE_SPEED, MOVE_SPEED);
    return player;
};

describe('Player anti-teleport rate check', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers({ now: 1_000_000, toFake: ['performance'] });
    });

    afterEach(() => {
        clock.restore();
    });

    it('should reject the hop-by-hop teleport that clears the per-packet cap', () => {
        const player = createPlayer();
        const budget = player.getMoveDistancePerMs()! * MOVE_WINDOW_MS * MOVE_DISTANCE_TOLERANCE;
        let accepted = 0;

        // The multihack's shape: 180-unit hops every 34ms, each well under the cap.
        for (let hop = 1; hop <= 30; hop++) {
            if (player.isMoveAllowed(START_X + hop * 180, START_Y)) accepted++;
            clock.tick(34);
        }

        const claimed = 30 * 180;
        expect(accepted * 180, 'the hack could not travel the distance it claimed').to.be.lessThan(claimed);
        expect(accepted * 180, 'accepted distance stayed within the speed budget').to.be.at.most(budget);
    });

    it('should accept an honest client reporting its position while it walks', () => {
        const player = createPlayer();
        const stepInterval = 300;
        const step = player.getMoveDistancePerMs()! * stepInterval;

        for (let i = 1; i <= 20; i++) {
            const allowed = player.isMoveAllowed(START_X + i * step, START_Y);
            expect(allowed, `honest step ${i} was accepted`).to.be.equal(true);
            clock.tick(stepInterval);
        }
    });

    it('should let a blocked client move again once the window drains', () => {
        const player = createPlayer();
        const step = player.getMoveDistancePerMs()! * 100;
        let x = START_X;

        // Burn the window's budget without advancing time.
        while (player.isMoveAllowed((x += step), START_Y)) {
            expect(x - START_X, 'the burst was bounded').to.be.lessThan(100_000);
        }

        clock.tick(MOVE_WINDOW_MS);

        // A rejected client is snapped back to the server position, so it
        // resumes from there rather than from where it claimed to be.
        expect(player.isMoveAllowed(START_X + step, START_Y), 'budget recovered after the window').to.be.equal(true);
    });

    it('should still reject a single jump beyond the per-packet cap', () => {
        const player = createPlayer();

        expect(player.isMoveAllowed(START_X + 5_000, START_Y)).to.be.equal(false);
    });

    it('should not bound movement when the class has no run animation', () => {
        const player = createPlayer({ animation: undefined });

        for (let hop = 1; hop <= 30; hop++) {
            expect(player.isMoveAllowed(START_X + hop * 180, START_Y)).to.be.equal(true);
            clock.tick(34);
        }
    });
});
