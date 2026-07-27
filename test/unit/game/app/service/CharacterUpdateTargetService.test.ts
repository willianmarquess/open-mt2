import Player from '@/core/domain/entities/game/player/Player';
import Monster from '@/core/domain/entities/game/mob/Monster';
import CharacterUpdateTargetService from '@/game/app/service/CharacterUpdateTargetService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('CharacterUpdateTargetService', function () {
    let loggerMock;
    let characterUpdateTargetService: CharacterUpdateTargetService;
    let entityManagerMock: any;

    beforeEach(function () {
        loggerMock = {
            info: sinon.spy(),
        };

        entityManagerMock = {
            getEntity: sinon.stub(),
        };

        characterUpdateTargetService = new CharacterUpdateTargetService({
            logger: loggerMock,
            entityManager: entityManagerMock,
        });
    });

    describe('execute', function () {
        it('should log and return if target is not a character', async function () {
            const playerMock = {
                getPositionX: sinon.stub().returns(10),
                getPositionY: sinon.stub().returns(20),
            };

            entityManagerMock.getEntity.returns(undefined);

            await characterUpdateTargetService.execute(playerMock as unknown as Player, 123);

            expect(entityManagerMock.getEntity.calledOnce).to.be.true;
            expect(entityManagerMock.getEntity.firstCall.args[0]).to.equal(123);

            expect(loggerMock.info.calledOnce).to.be.true;
            expect(loggerMock.info.firstCall.args[0]).to.equal(
                '[CharacterUpdateTargetService] Invalid target with virtualId 123',
            );
        });

        it('should update the target if area and target are found', async function () {
            const playerMock = {
                getPositionX: sinon.stub().returns(10),
                getPositionY: sinon.stub().returns(20),
                setTarget: sinon.spy(),
            };

            const targetMock = sinon.createStubInstance(Monster);

            entityManagerMock.getEntity.returns(targetMock);

            await characterUpdateTargetService.execute(playerMock as unknown as Player, 123);

            expect(entityManagerMock.getEntity.calledOnce).to.be.true;
            expect(entityManagerMock.getEntity.firstCall.args[0]).to.equal(123);

            expect(playerMock.setTarget.calledOnce).to.be.true;
            expect(playerMock.setTarget.firstCall.args[0]).to.equal(targetMock);
        });
    });
});
