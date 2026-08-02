import { expect } from 'chai';
import sinon from 'sinon';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import Logger from '@/core/infra/logger/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} };

const REGEN_INTERVAL = 3_000;
const RECOVERY_FLAT_HEALTH = 15;
const MAX_HEALTH = 1_000;
const MAX_MANA = 500;

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
                    initialHp: MAX_HEALTH,
                    initialMp: MAX_MANA,
                    initialStamina: 30,
                    hpPerLvl: 0,
                    hpPerHtPoint: 0,
                    mpPerLvl: 0,
                    mpPerIqPoint: 0,
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
            positionX: 100_000,
            positionY: 100_000,
            health: 1,
            mana: 1,
            stamina: 30,
            bodyPart: 0,
            hairPart: 0,
            name: 'healer',
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

    const sent: Array<any> = [];
    player.setConnection({ send: (packet: any) => sent.push(packet) } as any);

    // PlayerFactory does not run the private init(), so the max points are still
    // 0 here and every regen would early-return as "already full".
    player.onEquipmentChange();
    sent.length = 0;

    return { player, sent };
};

/**
 * Chat the player actually received. ChatOutPacket exposes no getter for its
 * message, so the text is read back off the packed buffer.
 */
const messages = (sent: Array<any>) =>
    sent.filter((p) => p.getName?.() === 'ChatOutPacket').map((p) => p.pack().toString('ascii'));

describe('Player recovery', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers({ now: 1_000_000, toFake: ['performance'] });
    });

    afterEach(() => {
        clock.restore();
    });

    describe('amount', () => {
        it('should heal the flat amount plus 1% right after moving', () => {
            const { player } = createPlayer();

            player.regenHealth();

            const expected = RECOVERY_FLAT_HEALTH + MAX_HEALTH * 0.01;
            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1 + expected);
        });

        it('should ramp to 5% once a full step has passed without moving', () => {
            const { player } = createPlayer();

            clock.tick(REGEN_INTERVAL);
            player.regenHealth();

            const expected = RECOVERY_FLAT_HEALTH + MAX_HEALTH * 0.05;
            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1 + expected);
        });

        it('should drop back to 1% after the character moves again', () => {
            const { player } = createPlayer();

            clock.tick(REGEN_INTERVAL * 5);
            player.goto({ positionX: 100_500, positionY: 100_000, arg: 0, rotation: 0, time: 0, movementType: 1 });
            player.regenHealth();

            const expected = RECOVERY_FLAT_HEALTH + MAX_HEALTH * 0.01;
            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1 + expected);
        });

        it('should apply the regen bonus to the whole amount, flat part included', () => {
            const { player } = createPlayer();
            player.addPoint(PointsEnum.HP_REGEN, 100);

            player.regenHealth();

            const base = RECOVERY_FLAT_HEALTH + MAX_HEALTH * 0.01;
            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1 + base * 2);
        });

        it('should not add the health flat amount to mana', () => {
            const { player } = createPlayer();

            player.regenMana();

            expect(player.getPoint(PointsEnum.MANA)).to.be.equal(1 + MAX_MANA * 0.01);
        });
    });

    describe('blocked while', () => {
        it('stunned', () => {
            const { player } = createPlayer();
            player.setAffectFlag(AffectBitsTypeEnum.STUN);

            player.regenHealth();

            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1);
        });

        it('poisoned', () => {
            const { player } = createPlayer();
            player.setAffectFlag(AffectBitsTypeEnum.POISON);

            player.regenHealth();

            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(1);
        });

        it('already at full health', () => {
            const { player, sent } = createPlayer();
            player.addPoint(PointsEnum.HEALTH, MAX_HEALTH);

            player.regenHealth();

            expect(player.getPoint(PointsEnum.HEALTH)).to.be.equal(MAX_HEALTH);
            expect(messages(sent)).to.deep.equal([]);
        });
    });
});

describe('Player debug chat', () => {
    it('should stay silent while debug mode is off', () => {
        const { player, sent } = createPlayer();

        player.regenHealth();
        player.debugChat('anything');

        expect(messages(sent)).to.deep.equal([]);
    });

    it('should emit regen messages once debug mode is on', () => {
        const { player, sent } = createPlayer();

        expect(player.toggleDebugMode()).to.be.equal(true);
        player.regenHealth();

        expect(messages(sent).some((m) => m.includes('[DEBUG]') && m.includes('HP REGEN'))).to.be.equal(true);
    });

    it('should go quiet again when toggled off', () => {
        const { player, sent } = createPlayer();

        player.toggleDebugMode();
        expect(player.toggleDebugMode()).to.be.equal(false);
        expect(player.isDebugMode()).to.be.equal(false);

        player.regenHealth();

        expect(messages(sent)).to.deep.equal([]);
    });
});
