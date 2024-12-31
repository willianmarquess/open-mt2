import Item from '@/core/domain/entities/game/item/Item';
import PlayerApplies from '@/core/domain/entities/game/player/delegate/PlayerApplies';
import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PlayerApplies', function () {
    let playerMock;
    let loggerMock;
    let playerApplies: PlayerApplies;

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
                getApplies: () => [
                    { type: ApplyTypeEnum.ATT_SPEED, value: 10 },
                    { type: ApplyTypeEnum.MOV_SPEED, value: 5 },
                ],
            } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(playerMock.addAttackSpeed.calledOnceWith(10)).to.be.true;
            expect(playerMock.addMovementSpeed.calledOnceWith(5)).to.be.true;
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                getApplies: () => [{ type: 'UNKNOWN_TYPE', value: 15 }],
            } as unknown as Item;

            playerApplies.addItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });

    describe('removeItemApplies', function () {
        it('should remove valid item effects from the player', function () {
            const item = {
                getApplies: () => [
                    { type: ApplyTypeEnum.HP_REGEN, value: 8 },
                    { type: ApplyTypeEnum.SP_REGEN, value: 12 },
                ],
            } as unknown as Item;

            playerApplies.removeItemApplies(item);

            expect(playerMock.addHealthRegen.calledOnceWith(-8)).to.be.true;
            expect(playerMock.addManaRegen.calledOnceWith(-12)).to.be.true;
        });

        it('should log debug message for unimplemented applies', function () {
            const item = {
                getApplies: () => [{ type: 'UNKNOWN_TYPE', value: 20 }],
            } as unknown as Item;

            playerApplies.removeItemApplies(item);

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.include('Apply not implemented yet: UNKNOWN_TYPE');
        });
    });
});
