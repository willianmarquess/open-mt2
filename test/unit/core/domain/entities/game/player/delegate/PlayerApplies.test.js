import { expect } from 'chai';
import sinon from 'sinon';
import PlayerApplies from '../../../../../../../../src/core/domain/entities/game/player/delegate/PlayerApplies';
import ApplyTypeEnum from '../../../../../../../../src/core/enum/ApplyTypeEnum';

describe('PlayerApplies', function () {
    let playerMock;
    let loggerMock;
    let playerApplies;

    beforeEach(function () {
        playerMock = {
            addAttackSpeed: sinon.spy(),
            addMovementSpeed: sinon.spy(),
            addHealthRegen: sinon.spy(),
            addManaRegen: sinon.spy(),
        };

        loggerMock = {
            debug: sinon.spy(),
        };

        playerApplies = new PlayerApplies(playerMock, loggerMock);
    });

    describe('addItemApplies', function () {
        it('should apply valid item effects to the player', function () {
            const item = {
                applies: [
                    { type: ApplyTypeEnum.APPLY_ATT_SPEED, value: 10 },
                    { type: ApplyTypeEnum.APPLY_MOV_SPEED, value: 5 },
                ],
            };

            playerApplies.addItemApplies(item);

            expect(playerMock.addAttackSpeed.calledOnceWith(10)).to.be.true;
            expect(playerMock.addMovementSpeed.calledOnceWith(5)).to.be.true;
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                applies: [{ type: 'UNKNOWN_TYPE', value: 15 }],
            };

            playerApplies.addItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });

    describe('removeItemApplies', function () {
        it('should remove valid item effects from the player', function () {
            const item = {
                applies: [
                    { type: ApplyTypeEnum.APPLY_HP_REGEN, value: 8 },
                    { type: ApplyTypeEnum.APPLY_SP_REGEN, value: 12 },
                ],
            };

            playerApplies.removeItemApplies(item);

            expect(playerMock.addHealthRegen.calledOnceWith(-8)).to.be.true;
            expect(playerMock.addManaRegen.calledOnceWith(-12)).to.be.true;
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                applies: [{ type: 'UNKNOWN_TYPE', value: 20 }],
            };

            playerApplies.removeItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });
});
