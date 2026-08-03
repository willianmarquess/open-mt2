import { expect } from 'chai';
import sinon from 'sinon';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Logger from '@/core/infra/logger/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} };

const TARGET_X = 200_000;
const TARGET_Y = 300_000;

const createPlayer = () => {
    const config: any = {
        SERVER_PORT: '13001',
        SERVER_ADDRESS: '127.0.0.1',
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
            positionX: 100_000,
            positionY: 100_000,
            health: 100,
            mana: 50,
            stamina: 30,
            bodyPart: 0,
            hairPart: 0,
            name: 'traveller',
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

describe('Player teleport', () => {
    afterEach(() => sinon.restore());

    describe('canTeleport', () => {
        it('should allow a player with nothing blocking it (issue #88)', () => {
            expect(createPlayer().canTeleport()).to.equal(true);
        });

        it('should refuse while a private shop is running', () => {
            const player = createPlayer();
            sinon.stub(player, 'isRunningPrivateShop').returns(true);
            expect(player.canTeleport()).to.equal(false);
        });

        it('should refuse during the shop-close grace period', () => {
            const player = createPlayer();
            sinon.stub(player, 'isShopCloseGracePeriod').returns(true);
            expect(player.canTeleport()).to.equal(false);
        });
    });

    describe('teleport', () => {
        it('should move the player to the target position (issue #88)', () => {
            const player = createPlayer();

            player.teleport(TARGET_X, TARGET_Y);

            expect(player.getPositionX()).to.equal(TARGET_X);
            expect(player.getPositionY()).to.equal(TARGET_Y);
        });

        it('should leave the player where it was when the teleport is refused', () => {
            const player = createPlayer();
            sinon.stub(player, 'isRunningPrivateShop').returns(true);
            const originX = player.getPositionX();
            const originY = player.getPositionY();

            player.teleport(TARGET_X, TARGET_Y);

            expect(player.getPositionX()).to.equal(originX);
            expect(player.getPositionY()).to.equal(originY);
        });
    });
});
