import { expect } from 'chai';
import sinon from 'sinon';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import Logger from '@/core/infra/logger/Logger';

const createPlayer = (saveResults: Array<PromiseSettledResult<unknown>> = []) => {
    const config: any = {
        empire: { red: { startPosX: 0, startPosY: 0 } },
        jobs: {
            warrior: {
                common: {
                    st: 10,
                    ht: 10,
                    dx: 10,
                    iq: 10,
                    initialHp: 1_000,
                    initialMp: 500,
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

    const saveCharacterService = { execute: sinon.stub().resolves(saveResults) };
    const logger: Logger = { info: () => {}, error: sinon.spy(), debug: () => {} } as any;

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
            name: 'leaver',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager: { getAnimation: () => undefined } as any,
            experienceManager: { getNeededExperience: () => 100 } as any,
            logger,
            saveCharacterService: saveCharacterService as any,
            questManager: { onDespawn: () => {} } as any,
            eventTimerManager: { removeTimer: () => {}, removeAllTimersFromOwner: () => {} } as any,
            mobManager: {} as any,
        },
    );

    return { player, saveCharacterService, logger };
};

describe('Player flush save (issue #149)', () => {
    it('flushSave saves exactly once, and a second flushSave is a no-op', async () => {
        const { player, saveCharacterService } = createPlayer();

        await player.flushSave();
        await player.flushSave();

        expect(saveCharacterService.execute.callCount).to.equal(1);
    });

    it('onDespawn after flushSave does not save a second time', async () => {
        const { player, saveCharacterService } = createPlayer();

        await player.flushSave();
        await player.onDespawn();

        expect(saveCharacterService.execute.callCount).to.equal(1);
    });

    it('onDespawn without a flush still saves — a teleport despawn keeps its deferred save', async () => {
        const { player, saveCharacterService } = createPlayer();

        await player.onDespawn();

        expect(saveCharacterService.execute.callCount).to.equal(1);
    });

    it('save() after flushSave is a no-op, so a stale instance cannot overwrite the row', async () => {
        const { player, saveCharacterService } = createPlayer();

        await player.flushSave();
        player.save();

        expect(saveCharacterService.execute.callCount).to.equal(1);
    });

    it('flushSave logs a rejected write instead of swallowing it', async () => {
        const { player, logger } = createPlayer([{ status: 'rejected', reason: new Error('update failed') }]);

        await player.flushSave();

        const errorSpy = logger.error as sinon.SinonSpy;
        expect(errorSpy.callCount).to.equal(1);
        expect(String(errorSpy.firstCall.args[0])).to.include('logout save failed for leaver');
        expect(String(errorSpy.firstCall.args[0])).to.include('update failed');
    });
});
