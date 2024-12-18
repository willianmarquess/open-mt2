import { expect } from 'chai';
import sinon from 'sinon';
import MoveItemService from '../../../../../src/game/app/service/MoveItemService';

describe('MoveItemService', function () {
    let loggerMock;
    let itemManagerMock;
    let moveItemService;

    beforeEach(function () {
        loggerMock = {
            debug: sinon.spy(),
        };

        itemManagerMock = {
            update: sinon.stub().resolves(),
        };

        moveItemService = new MoveItemService({
            logger: loggerMock,
            itemManager: itemManagerMock,
        });
    });

    describe('execute', function () {
        it('should log the move and update the item if moveItem returns an item', async function () {
            const updatedItem = { id: 1 };
            const playerMock = {
                moveItem: sinon.stub().returns(updatedItem),
            };

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
            });

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.equal('[MoveItemService] moving item from 2 to 3');

            expect(playerMock.moveItem.calledOnce).to.be.true;
            expect(playerMock.moveItem.firstCall.args[0]).to.deep.equal({
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
            });

            expect(itemManagerMock.update.calledOnce).to.be.true;
            expect(itemManagerMock.update.firstCall.args[0]).to.equal(updatedItem);
        });

        it('should log the move and not call update if moveItem returns undefined', async function () {
            const playerMock = {
                moveItem: sinon.stub().returns(undefined),
            };

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
            });

            expect(loggerMock.debug.calledOnce).to.be.true;
            expect(loggerMock.debug.firstCall.args[0]).to.equal('[MoveItemService] moving item from 2 to 3');

            expect(playerMock.moveItem.calledOnce).to.be.true;
            expect(playerMock.moveItem.firstCall.args[0]).to.deep.equal({
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
            });

            expect(itemManagerMock.update.notCalled).to.be.true;
        });
    });
});
