import Player from '@/core/domain/entities/game/player/Player';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import CharacterMoveService from '@/game/app/service/CharacterMoveService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('CharacterMoveService', function () {
    let loggerMock;
    let characterMoveService: CharacterMoveService;

    beforeEach(function () {
        loggerMock = {
            info: sinon.spy(),
        };

        characterMoveService = new CharacterMoveService({ logger: loggerMock });
    });

    describe('execute', function () {
        it('should add experience and move the player for MOVE movement type', async function () {
            const playerMock = {
                addExperience: sinon.spy(),
                goto: sinon.spy(),
            };

            const params = {
                player: playerMock as unknown as Player,
                movementType: MovementTypeEnum.MOVE,
                positionX: 10,
                positionY: 20,
                arg: 5,
                rotation: 90,
                time: 1000,
            };

            await characterMoveService.execute(params);

            expect(playerMock.addExperience.calledOnce).to.be.true;
            expect(playerMock.addExperience.firstCall.args[0]).to.equal(500);

            expect(playerMock.goto.calledOnce).to.be.true;
            expect(playerMock.goto.firstCall.args[0]).to.deep.equal({
                positionX: params.positionX,
                positionY: params.positionY,
                arg: params.arg,
                rotation: params.rotation,
                time: params.time,
                movementType: MovementTypeEnum.MOVE,
            });
        });

        it('should call wait on the player for WAIT movement type', async function () {
            const playerMock = {
                wait: sinon.spy(),
            };

            const params = {
                player: playerMock as unknown as Player,
                movementType: MovementTypeEnum.WAIT,
                positionX: 10,
                positionY: 20,
                arg: 5,
                rotation: 90,
                time: 1000,
            };

            await characterMoveService.execute(params);

            expect(playerMock.wait.calledOnce).to.be.true;
            expect(playerMock.wait.firstCall.args[0]).to.deep.equal({
                positionX: params.positionX,
                positionY: params.positionY,
                arg: params.arg,
                rotation: params.rotation,
                time: params.time,
                movementType: MovementTypeEnum.WAIT,
            });
        });

        it('should call sync on the player for ATTACK or COMBO movement type', async function () {
            const playerMock = {
                sync: sinon.spy(),
            };

            const params = {
                player: playerMock as unknown as Player,
                movementType: MovementTypeEnum.ATTACK,
                positionX: 10,
                positionY: 20,
                arg: 5,
                rotation: 90,
                time: 1000,
            };

            await characterMoveService.execute(params);

            expect(playerMock.sync.calledOnce).to.be.true;
            expect(playerMock.sync.firstCall.args[0]).to.deep.equal({
                positionX: params.positionX,
                positionY: params.positionY,
                arg: params.arg,
                rotation: params.rotation,
                time: params.time,
                movementType: MovementTypeEnum.ATTACK,
            });
        });
    });
});
