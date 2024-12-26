import Player from '@/core/domain/entities/game/player/Player';
import CharacterUpdateTargetService from '@/game/app/service/CharacterUpdateTargetService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('CharacterUpdateTargetService', function () {
    let loggerMock;
    let worldMock;
    let characterUpdateTargetService: CharacterUpdateTargetService;

    beforeEach(function () {
        loggerMock = {
            info: sinon.spy(),
        };

        worldMock = {
            getAreaByCoordinates: sinon.stub(),
        };

        characterUpdateTargetService = new CharacterUpdateTargetService({
            logger: loggerMock,
            world: worldMock,
        });
    });

    describe('execute', function () {
        it('should log and return if area is not found', async function () {
            const playerMock = {
                getPositionX: sinon.stub().returns(10),
                getPositionY: sinon.stub().returns(20),
            };

            worldMock.getAreaByCoordinates.returns(undefined);

            await characterUpdateTargetService.execute(playerMock as unknown as Player as unknown as Player, 123);

            expect(worldMock.getAreaByCoordinates.calledOnce).to.be.true;
            expect(worldMock.getAreaByCoordinates.firstCall.args).to.deep.equal([10, 20]);

            expect(loggerMock.info.calledOnce).to.be.true;
            expect(loggerMock.info.firstCall.args[0]).to.equal(
                '[CharacterUpdateTargetService] Area not found at x: 10, y: 20',
            );
        });

        it('should log and return if target is not found', async function () {
            const playerMock = {
                getPositionX: sinon.stub().returns(10),
                getPositionY: sinon.stub().returns(20),
            };

            const areaMock = {
                getEntity: sinon.stub().returns(undefined),
            };

            worldMock.getAreaByCoordinates.returns(areaMock);

            await characterUpdateTargetService.execute(playerMock as unknown as Player, 123);

            expect(areaMock.getEntity.calledOnce).to.be.true;
            expect(areaMock.getEntity.firstCall.args[0]).to.equal(123);

            expect(loggerMock.info.calledOnce).to.be.true;
            expect(loggerMock.info.firstCall.args[0]).to.equal(
                '[CharacterUpdateTargetService] Target not found with virtualId 123',
            );
        });

        it('should update the target if area and target are found', async function () {
            const playerMock = {
                getPositionX: sinon.stub().returns(10),
                getPositionY: sinon.stub().returns(20),
                setTarget: sinon.spy(),
            };

            const targetMock = {};

            const areaMock = {
                getEntity: sinon.stub().returns(targetMock),
            };

            worldMock.getAreaByCoordinates.returns(areaMock);

            await characterUpdateTargetService.execute(playerMock as unknown as Player, 123);

            expect(areaMock.getEntity.calledOnce).to.be.true;
            expect(areaMock.getEntity.firstCall.args[0]).to.equal(123);

            expect(playerMock.setTarget.calledOnce).to.be.true;
            expect(playerMock.setTarget.firstCall.args[0]).to.equal(targetMock);
        });
    });
});
