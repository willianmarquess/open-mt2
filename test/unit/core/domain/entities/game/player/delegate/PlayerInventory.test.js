import { expect } from 'chai';
import sinon from 'sinon';
import PlayerInventory from '../../../../../../../../src/core/domain/entities/game/player/delegate/PlayerInventory';
import WindowTypeEnum from '../../../../../../../../src/core/enum/WindowTypeEnum';
import ItemAddedEvent from '../../../../../../../../src/core/domain/entities/game/player/events/ItemAddedEvent';
import ItemRemovedEvent from '../../../../../../../../src/core/domain/entities/game/player/events/ItemRemovedEvent';
import ItemDroppedEvent from '../../../../../../../../src/core/domain/entities/game/player/events/ItemDroppedEvent';
import ItemDroppedHideEvent from '../../../../../../../../src/core/domain/entities/game/player/events/ItemDroppedHideEvent';

describe('PlayerInventory', function () {
    let playerMock;
    let playerInventory;

    beforeEach(function () {
        playerMock = {
            level: 10,
            antiFlagClass: 1,
            antiFlagGender: 2,
            inventory: {
                getItem: sinon.stub(),
                isValidPosition: sinon.stub(),
                haveAvailablePosition: sinon.stub(),
                isEquipmentPosition: sinon.stub(),
                isValidSlot: sinon.stub(),
                removeItem: sinon.spy(),
                addItemAt: sinon.spy(),
                addItem: sinon.stub(),
                items: new Map(),
            },
            publish: sinon.spy(),
            updateView: sinon.spy(),
            chat: sinon.spy(),
        };

        playerInventory = new PlayerInventory(playerMock);
    });

    describe('sendItemAdded', function () {
        it('should publish an ItemAddedEvent with correct arguments', function () {
            const item = {
                id: 1,
                count: 2,
                flags: { flag: 3 },
                antiFlags: { flag: 4 },
            };

            playerInventory.sendItemAdded({
                window: WindowTypeEnum.INVENTORY,
                position: 5,
                item,
            });

            expect(playerMock.publish.calledOnce).to.be.true;
            expect(playerMock.publish.firstCall.args[0]).to.equal(ItemAddedEvent.type);
            const event = playerMock.publish.firstCall.args[1];
            expect(event).to.be.instanceOf(ItemAddedEvent);
            expect(event).to.deep.include({
                window: WindowTypeEnum.INVENTORY,
                position: 5,
                id: 1,
                count: 2,
                flags: 3,
                antiFlags: 4,
            });
        });
    });

    describe('sendItemRemoved', function () {
        it('should publish an ItemRemovedEvent with correct arguments', function () {
            playerInventory.sendItemRemoved({
                window: WindowTypeEnum.INVENTORY,
                position: 5,
            });

            expect(playerMock.publish.calledOnce).to.be.true;
            expect(playerMock.publish.firstCall.args[0]).to.equal(ItemRemovedEvent.type);
            const event = playerMock.publish.firstCall.args[1];
            expect(event).to.be.instanceOf(ItemRemovedEvent);
            expect(event).to.deep.include({
                window: WindowTypeEnum.INVENTORY,
                position: 5,
            });
        });
    });

    describe('getItem', function () {
        it('should return the correct item for a given position', function () {
            const item = { id: 1 };
            playerMock.inventory.getItem.returns(item);

            const result = playerInventory.getItem(3);

            expect(result).to.equal(item);
            expect(playerMock.inventory.getItem.calledOnceWith(3)).to.be.true;
        });
    });

    describe('isWearable', function () {
        it('should return true for a wearable item', function () {
            const item = {
                getLevelLimit: sinon.stub().returns(5),
                wearFlags: { flag: 1 },
                antiFlags: { is: sinon.stub().returns(false) },
            };

            const result = playerInventory.isWearable(item);

            expect(result).to.be.true;
            expect(item.getLevelLimit.calledOnce).to.be.true;
            expect(item.antiFlags.is.calledTwice).to.be.true;
        });

        it('should return false for an unwearable item', function () {
            const item = {
                getLevelLimit: sinon.stub().returns(15),
                wearFlags: { flag: 0 },
                antiFlags: { is: sinon.stub().returns(false) },
            };

            const result = playerInventory.isWearable(item);

            expect(result).to.be.false;
        });
    });

    describe('moveItem', function () {
        it('should move an item if all conditions are met', function () {
            const item = {
                id: 1,
                size: 2,
                flags: { flag: 3 },
                antiFlags: { flag: 4 },
            };
            playerMock.inventory.getItem.returns(item);
            playerMock.inventory.isValidPosition.returns(true);
            playerMock.inventory.haveAvailablePosition.returns(true);

            const result = playerInventory.moveItem({
                fromWindow: WindowTypeEnum.INVENTORY,
                fromPosition: 1,
                toWindow: WindowTypeEnum.INVENTORY,
                toPosition: 2,
            });

            expect(result).to.equal(item);
            expect(playerMock.inventory.removeItem.calledOnceWith(1, 2)).to.be.true;
            expect(playerMock.inventory.addItemAt.calledOnceWith(item, 2)).to.be.true;
        });

        it('should not move an item if any condition is not met', function () {
            playerMock.inventory.isValidPosition.returns(false);

            const result = playerInventory.moveItem({
                fromWindow: WindowTypeEnum.INVENTORY,
                fromPosition: 1,
                toWindow: WindowTypeEnum.INVENTORY,
                toPosition: 2,
            });

            expect(result).to.be.undefined;
            expect(playerMock.inventory.removeItem.notCalled).to.be.true;
            expect(playerMock.inventory.addItemAt.notCalled).to.be.true;
        });
    });

    describe('addItem', function () {
        it('should add an item and send an ItemAddedEvent', function () {
            const item = {
                id: 1,
                flags: { flag: 3 },
                antiFlags: { flag: 4 },
            };
            playerMock.inventory.addItem.returns(2);

            const result = playerInventory.addItem(item);

            expect(result).to.be.true;
            expect(playerMock.inventory.addItem.calledOnceWith(item)).to.be.true;
            expect(playerMock.publish.calledOnce).to.be.true;
        });

        it('should not add an item if the inventory is full', function () {
            const item = { id: 1 };
            playerMock.inventory.addItem.returns(-1);

            const result = playerInventory.addItem(item);

            expect(result).to.be.false;
            expect(playerMock.publish.notCalled).to.be.true;
            expect(playerMock.chat.calledOnce).to.be.true;
        });
    });

    describe('sendInventory', function () {
        it('should send all items in the inventory', function () {
            playerMock.inventory.items.set(1, {
                window: WindowTypeEnum.INVENTORY,
                position: 1,
                id: 1,
                flags: { flag: 3 },
                antiFlags: { flag: 4 },
            });

            playerInventory.sendInventory();

            expect(playerMock.publish.calledOnce).to.be.true;
            expect(playerMock.updateView.calledOnce).to.be.true;
        });
    });

    describe('showDroppedItem', function () {
        it('should publish an ItemDroppedEvent', function () {
            playerInventory.showDroppedItem({
                virtualId: 1,
                count: 10,
                positionX: 100,
                positionY: 200,
                ownerName: 'player',
                id: 1,
            });

            expect(playerMock.publish.calledOnce).to.be.true;
            expect(playerMock.publish.firstCall.args[0]).to.equal(ItemDroppedEvent.type);
        });
    });

    describe('hideDroppedItem', function () {
        it('should publish an ItemDroppedHideEvent', function () {
            playerInventory.hideDroppedItem({ virtualId: 1 });

            expect(playerMock.publish.calledOnce).to.be.true;
            expect(playerMock.publish.firstCall.args[0]).to.equal(ItemDroppedHideEvent.type);
        });
    });
});
