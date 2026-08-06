import { expect } from 'chai';
import sinon from 'sinon';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import UseItemService from '@/game/app/service/UseItemService';

describe('UseItemService', () => {
    let loggerStub;
    let itemManagerStub;
    let mobManagerStub;
    let service: UseItemService;
    let playerStub;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        itemManagerStub = { update: sinon.stub().resolves() };
        mobManagerStub = { hasMob: sinon.stub().resolves() };
        service = new UseItemService({
            logger: loggerStub,
            itemManager: itemManagerStub,
            mobManager: mobManagerStub,
        });
        playerStub = {
            getItem: sinon.stub(),
            isItemLockedInPrivateShop: sinon.stub().returns(false),
            getInventory: sinon.stub(),
            sendItemRemoved: sinon.stub(),
            sendItemAdded: sinon.stub(),
            chat: sinon.stub(),
            isWearable: sinon.stub(),
            getEquipFailureReason: sinon.stub(),
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

    it('should unequip a worn item back into the inventory', async () => {
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
        expect(
            playerStub.sendItemRemoved.calledOnceWith({ window: WindowTypeEnum.EQUIPMENT, position: 2 }),
            'the removal is echoed for the window the item actually left',
        ).to.be.true;
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

    it('should explain why equipment the player cannot wear was refused (issue #57)', async () => {
        const mockItem = { getType: sinon.stub() };
        playerStub.getItem.returns(mockItem);
        playerStub.isWearable.returns(false);
        playerStub.getEquipFailureReason.returns('Your level is too low to equip this item. Required level: 105.');

        await service.execute(playerStub, 1, 2);

        expect(
            playerStub.chat.calledOnceWith({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Your level is too low to equip this item. Required level: 105.',
            }),
        ).to.be.true;
        expect(mockItem.getType.notCalled).to.be.true;
        expect(playerStub.getInventory.notCalled).to.be.true;
    });

    it('should still route non-equipment items to the non-wearable handlers without chatting', async () => {
        const mockItem = { getType: sinon.stub().returns(0), getSubType: sinon.stub().returns(0) };
        playerStub.getItem.returns(mockItem);
        playerStub.isWearable.returns(false);
        playerStub.getEquipFailureReason.returns(undefined);

        await service.execute(playerStub, 1, 2);

        expect(playerStub.chat.notCalled).to.be.true;
        expect(mockItem.getType.called).to.be.true;
    });

    describe('window validation (issue #103)', () => {
        const unimplementedWindows = [
            ['SAFEBOX', WindowTypeEnum.SAFEBOX],
            ['MALL', WindowTypeEnum.MALL],
            ['DRAGON_SOUL_INVENTORY', WindowTypeEnum.DRAGON_SOUL_INVENTORY],
            ['BELT_INVENTORY', WindowTypeEnum.BELT_INVENTORY],
            ['RESERVED_WINDOW', WindowTypeEnum.RESERVED_WINDOW],
        ] as const;

        for (const [name, window] of unimplementedWindows) {
            it(`should ignore a use addressed to ${name}, which has no backing store`, async () => {
                playerStub.getItem.returns({ getSize: () => 1 });

                await service.execute(playerStub, window, 2);

                expect(playerStub.getItem.notCalled, 'the position must not be resolved against the inventory').to.be
                    .true;
                expect(playerStub.sendItemRemoved.notCalled, 'and nothing is echoed back').to.be.true;
            });
        }

        it('should not disconnect a client that names an unimplemented window', async () => {
            await service.execute(playerStub, WindowTypeEnum.DRAGON_SOUL_INVENTORY, 2);

            expect(playerStub.chat.notCalled, 'the original returns false silently').to.be.true;
        });

        for (const [name, window] of [
            ['INVENTORY', WindowTypeEnum.INVENTORY],
            ['EQUIPMENT', WindowTypeEnum.EQUIPMENT],
        ] as const) {
            it(`should still handle a use addressed to ${name}`, async () => {
                playerStub.getItem.returns(undefined);

                await service.execute(playerStub, window, 2);

                expect(playerStub.getItem.calledOnceWith(2)).to.be.true;
            });
        }
    });
});
