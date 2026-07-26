import MoveItemService from '@/game/app/service/MoveItemService';
import { expect } from 'chai';
import sinon from 'sinon';

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
            save: sinon.stub().resolves(),
            flush: sinon.stub().resolves(),
            getItem: sinon.stub(),
        };

        moveItemService = new MoveItemService({
            logger: loggerMock,
            itemManager: itemManagerMock,
        });
    });

    const makeItem = (overrides = {}) => ({
        getId: sinon.stub().returns(27001),
        getCount: sinon.stub().returns(10),
        setCount: sinon.spy(),
        getSize: sinon.stub().returns(1),
        isStackable: sinon.stub().returns(true),
        ...overrides,
    });

    describe('execute', function () {
        it('should move the whole item and update it when count is 0', async function () {
            const item = makeItem({ isStackable: sinon.stub().returns(false) });
            const updatedItem = { id: 1 };
            const playerMock = {
                getItem: sinon.stub().returns(item),
                moveItem: sinon.stub().returns(updatedItem),
            };

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
                count: 0,
            });

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

        it('should not call update if moveItem returns undefined', async function () {
            const item = makeItem();
            const playerMock = {
                getItem: sinon.stub().returns(item),
                moveItem: sinon.stub().returns(undefined),
            };

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
                count: 10,
            });

            expect(playerMock.moveItem.calledOnce).to.be.true;
            expect(itemManagerMock.update.notCalled).to.be.true;
        });

        it('should split a stack into an empty slot when count is smaller than the stack', async function () {
            const item = makeItem();
            const newStack = makeItem({ getCount: sinon.stub().returns(4) });
            const inventoryMock = {
                isValidPosition: sinon.stub().returns(true),
                isEquipmentPosition: sinon.stub().returns(false),
                haveAvailablePosition: sinon.stub().returns(true),
                addItemAt: sinon.spy(),
            };
            const playerMock = {
                getId: sinon.stub().returns(1),
                getItem: sinon.stub(),
                moveItem: sinon.stub(),
                getInventory: sinon.stub().returns(inventoryMock),
                sendItemAdded: sinon.spy(),
                sendItemUpdate: sinon.spy(),
            };
            playerMock.getItem.withArgs(2).returns(item);
            playerMock.getItem.withArgs(3).returns(undefined);
            itemManagerMock.getItem.returns(newStack);

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
                count: 4,
            });

            expect(playerMock.moveItem.notCalled).to.be.true;
            expect(inventoryMock.addItemAt.calledOnceWith(newStack, 3)).to.be.true;
            expect(item.setCount.calledOnceWith(6)).to.be.true;
            expect(itemManagerMock.save.calledOnceWith(newStack)).to.be.true;
            expect(itemManagerMock.update.calledOnceWith(item)).to.be.true;
        });

        it('should merge a split into a same-proto stack at the target slot', async function () {
            const item = makeItem();
            const target = makeItem({ getCount: sinon.stub().returns(195) });
            const inventoryMock = {
                isValidPosition: sinon.stub().returns(true),
                isEquipmentPosition: sinon.stub().returns(false),
            };
            const playerMock = {
                getId: sinon.stub().returns(1),
                getItem: sinon.stub(),
                moveItem: sinon.stub(),
                getInventory: sinon.stub().returns(inventoryMock),
                sendItemUpdate: sinon.spy(),
            };
            playerMock.getItem.withArgs(2).returns(item);
            playerMock.getItem.withArgs(3).returns(target);

            await moveItemService.execute({
                player: playerMock,
                fromWindow: 1,
                fromPosition: 2,
                toWindow: 1,
                toPosition: 3,
                count: 8,
            });

            // Only 5 units fit (195 + 5 = 200 cap)
            expect(target.setCount.calledOnceWith(200)).to.be.true;
            expect(item.setCount.calledOnceWith(5)).to.be.true;
            expect(itemManagerMock.update.calledTwice).to.be.true;
        });
    });
});
