import { expect } from 'chai';
import sinon from 'sinon';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import UseItemService from '@/game/app/service/UseItemService';

describe('UseItemService', () => {
    let loggerStub;
    let itemManagerStub;
    let service: UseItemService;
    let playerStub;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        itemManagerStub = { update: sinon.stub().resolves() };
        service = new UseItemService({ logger: loggerStub, itemManager: itemManagerStub });
        playerStub = {
            getItem: sinon.stub(),
            getInventory: sinon.stub(),
            sendItemRemoved: sinon.stub(),
            sendItemAdded: sinon.stub(),
            chat: sinon.stub(),
            isWearable: sinon.stub(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should not use item if not found in inventory', async () => {
        playerStub.getItem.returns(null);

        await service.execute(playerStub, 1, 2);

        expect(playerStub.getItem.calledOnceWith(2)).to.be.true;
        expect(playerStub.getInventory.notCalled).to.be.true;
        expect(itemManagerStub.update.notCalled).to.be.true;
    });

    it('should equip a wearable item from inventory', async () => {
        const mockItem = { getSize: () => 1, isWearable: true };
        playerStub.getItem.returns(mockItem);
        playerStub.isWearable.returns(true);
        const inventoryStub = {
            isEquipmentPosition: sinon.stub().returns(true),
            removeItem: sinon.stub(),
            addItem: sinon.stub().returns(3),
            sendItemRemoved: sinon.stub(),
            sendItemAdded: sinon.stub(),
        };
        playerStub.getInventory.returns(inventoryStub);

        await service.execute(playerStub, 1, 2);

        expect(playerStub.getItem.calledOnceWith(2)).to.be.true;
        expect(playerStub.isWearable.calledOnceWith(mockItem)).to.be.true;
        expect(inventoryStub.isEquipmentPosition.calledOnceWith(2)).to.be.true;
        expect(inventoryStub.removeItem.calledOnceWith(2, 1)).to.be.true;
        expect(inventoryStub.addItem.calledOnceWith(mockItem)).to.be.true;
        expect(playerStub.sendItemRemoved.calledOnceWith({ window: 1, position: 2 })).to.be.true;
        expect(
            playerStub.sendItemAdded.calledOnceWith({ window: WindowTypeEnum.INVENTORY, position: 3, item: mockItem }),
        ).to.be.true;
        expect(itemManagerStub.update.calledOnceWith(mockItem)).to.be.true;
        expect(playerStub.chat.notCalled).to.be.true;
    });

    it('should not equip a wearable item if inventory is full', async () => {
        const mockItem = { getSize: () => 1, isWearable: true };
        playerStub.getItem.returns(mockItem);
        playerStub.isWearable.returns(true);

        const inventoryStub = {
            isEquipmentPosition: sinon.stub().returns(true),
            removeItem: sinon.stub(),
            addItem: sinon.stub().returns(-1),
            addItemAt: sinon.stub(),
            chat: sinon.stub(),
        };
        playerStub.getInventory.returns(inventoryStub);

        await service.execute(playerStub, 1, 2);

        expect(inventoryStub.addItemAt.calledOnceWith(mockItem, 2)).to.be.true;
        expect(playerStub.chat.calledOnceWith({ messageType: ChatMessageTypeEnum.INFO, message: 'Inventory is full' }))
            .to.be.true;
    });

    it('should equip wearable from non-equipment slot - no item equipped', async () => {
        const mockItem = { getSize: () => 1, isWearable: true };
        playerStub.getItem.onCall(0).returns(mockItem);
        playerStub.getItem.onCall(1).returns(undefined);
        playerStub.isWearable.returns(true);

        const inventoryStub = {
            isEquipmentPosition: sinon.stub().returns(false),
            getWearPosition: sinon.stub().returns(4),
            removeItem: sinon.stub(),
            addItemAt: sinon.stub(),
            sendItemRemoved: sinon.stub(),
            sendItemAdded: sinon.stub(),
        };
        playerStub.getInventory.returns(inventoryStub);

        await service.execute(playerStub, 1, 2);

        expect(inventoryStub.removeItem.calledOnceWith(2, 1)).to.be.true;
        expect(inventoryStub.addItemAt.calledOnceWith(mockItem, 4)).to.be.true;
        expect(playerStub.sendItemRemoved.calledOnceWith({ window: WindowTypeEnum.INVENTORY, position: 2 })).to.be.true;
        expect(
            playerStub.sendItemAdded.calledOnceWith({ window: WindowTypeEnum.EQUIPMENT, position: 4, item: mockItem }),
        ).to.be.true;
        expect(itemManagerStub.update.calledOnceWith(mockItem)).to.be.true;
    });

    it('should equip wearable from non-equipment slot - item equipped and inventory full', async () => {
        const mockItem = { getSize: () => 1, isWearable: true };
        const mockEquippedItem = { getSize: () => 2, isWearable: true };
        playerStub.getItem.onCall(0).returns(mockItem);
        playerStub.getItem.onCall(1).returns(mockEquippedItem);
        playerStub.isWearable.returns(true);

        const inventoryStub = {
            isEquipmentPosition: sinon.stub().returns(false),
            getWearPosition: sinon.stub().returns(4),
            removeItem: sinon.stub(),
            addItem: sinon.stub().returns(-1),
            addItemAt: sinon.stub(),
            chat: sinon.stub(),
        };
        playerStub.getInventory.returns(inventoryStub);

        await service.execute(playerStub, 1, 2);

        expect(inventoryStub.addItemAt.calledWith(mockItem, 2)).to.be.true;
        expect(inventoryStub.addItemAt.calledWith(mockEquippedItem, 4)).to.be.true;
        expect(playerStub.chat.calledOnceWith({ messageType: ChatMessageTypeEnum.INFO, message: 'Inventory is full' }))
            .to.be.true;
    });

    it('should equip wearable from non-equipment slot - item equipped and inventory not full', async () => {
        const mockItem = { getSize: () => 1, isWearable: true };
        const mockEquippedItem = { getSize: () => 2, isWearable: true };
        playerStub.getItem.onCall(0).returns(mockItem);
        playerStub.getItem.onCall(1).returns(mockEquippedItem);
        playerStub.isWearable.returns(true);

        const inventoryStub = {
            isEquipmentPosition: sinon.stub().returns(false),
            getWearPosition: sinon.stub().returns(4),
            removeItem: sinon.stub(),
            addItem: sinon.stub().returns(5),
            addItemAt: sinon.stub(),
            sendItemRemoved: sinon.stub(),
            sendItemAdded: sinon.stub(),
        };
        playerStub.getInventory.returns(inventoryStub);

        await service.execute(playerStub, 1, 2);
        expect(inventoryStub.removeItem.calledWith(2, mockItem.getSize())).to.be.true;
        expect(inventoryStub.removeItem.calledWith(4, mockEquippedItem.getSize())).to.be.true;
        expect(inventoryStub.addItemAt.calledWith(mockItem, 4)).to.be.true;
        expect(playerStub.sendItemRemoved.calledWith({ window: WindowTypeEnum.EQUIPMENT, position: 4 })).to.be.true;
        expect(playerStub.sendItemRemoved.calledWith({ window: WindowTypeEnum.INVENTORY, position: 2 })).to.be.true;
    });
});
