import { expect } from 'chai';
import sinon from 'sinon';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Logger from '@/core/infra/logger/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} };

const SHOUT_COOLDOWN_MS = 15_000;

// Inside the window where performance.now() < SHOUT_COOLDOWN_MS, i.e. the
// first seconds of the process — the dead zone issue #99 describes.
const EARLY_UPTIME_MS = 5_000;

const createPlayer = () => {
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

    return PlayerFactory.create(
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
            positionX: 0,
            positionY: 0,
            health: 100,
            mana: 50,
            stamina: 30,
            bodyPart: 0,
            hairPart: 0,
            name: 'shouter',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager: { getAnimation: () => undefined } as any,
            experienceManager: { getNeededExperience: () => 100 } as any,
            logger,
            saveCharacterService: {} as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
            mobManager: {} as any,
        },
    );
};

describe('Player shout cooldown', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers({ now: EARLY_UPTIME_MS, toFake: ['performance'] });
    });

    afterEach(() => {
        clock.restore();
    });

    it('should allow the first shout right after server start (issue #99)', () => {
        expect(createPlayer().isShoutAllowed()).to.equal(true);
    });

    it('should keep enforcing the cooldown between two shouts', () => {
        const player = createPlayer();

        expect(player.isShoutAllowed()).to.equal(true);
        clock.tick(SHOUT_COOLDOWN_MS - 1);
        expect(player.isShoutAllowed(), 'a shout inside the cooldown is rejected').to.equal(false);
        clock.tick(1);
        expect(player.isShoutAllowed(), 'a shout after the cooldown is allowed').to.equal(true);
    });
});
