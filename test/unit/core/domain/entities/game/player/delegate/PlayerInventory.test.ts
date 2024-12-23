import Item from '@/core/domain/entities/game/item/Item';
import PlayerInventory from '@/core/domain/entities/game/player/delegate/PlayerInventory';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PlayerInventory', () => {
    let player: any;
    let playerInventory: PlayerInventory;
    let publishSpy: sinon.SinonSpy;
    let chatSpy: sinon.SinonSpy;
    let updateViewSpy: sinon.SinonSpy;

    beforeEach(() => {
        player = {
            publish: sinon.spy(),
            chat: sinon.spy(),
            getInventory: sinon.stub().returns({
                addItem: sinon.stub(),
                getItem: sinon.stub(),
                isValidPosition: sinon.stub().returns(true),
                haveAvailablePosition: sinon.stub().returns(true),
                isEquipmentPosition: sinon.stub().returns(false),
                removeItem: sinon.spy(),
                addItemAt: sinon.spy(),
                getItems: sinon.stub().returns(new Map()),
                getItemFromSlot: sinon.stub(),
            }),
            updateView: sinon.spy(),
        } as unknown as Player;

        playerInventory = new PlayerInventory(player);
        publishSpy = player.publish;
        chatSpy = player.chat;
        updateViewSpy = player.updateView;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should add an item to the inventory and send the item added event', () => {
        const item = {
            getId: () => 1,
            getCount: () => 1,
            getFlags: () => ({ getFlag: () => 0 }),
            getAntiFlags: () => ({ getFlag: () => 0 }),
            getSize: () => 1,
            getWindow: () => WindowTypeEnum.INVENTORY,
            getPosition: () => 0,
        } as unknown as Item;

        player.getInventory().addItem.returns(0);

        const result = playerInventory.addItem(item);

        expect(result).to.be.true;
        expect(publishSpy.calledOnce).to.be.true;
        expect(
            publishSpy.calledWithMatch({
                window: WindowTypeEnum.INVENTORY,
                position: 0,
            }),
        ).to.be.true;
    });

    it('should not add an item if inventory is full', () => {
        player.getInventory().addItem.returns(-1);
        const item = {} as unknown as Item;

        const result = playerInventory.addItem(item);

        expect(result).to.be.false;
        expect(chatSpy.calledOnce).to.be.true;
        expect(
            chatSpy.calledWithMatch({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Inventory is full',
            }),
        ).to.be.true;
    });

    it('should remove and move an item in the inventory', () => {
        const item = {
            getSize: () => 1,
            getId: () => 1,
            getCount: () => 1,
            getFlags: () => ({ getFlag: () => 0 }),
            getAntiFlags: () => ({ getFlag: () => 0 }),
        } as unknown as Item;

        player.getInventory().getItem.returns(item);

        const result = playerInventory.moveItem({
            fromWindow: WindowTypeEnum.INVENTORY,
            fromPosition: 0,
            toWindow: WindowTypeEnum.INVENTORY,
            toPosition: 1,
        });

        expect(result).to.equal(item);
        expect(player.getInventory().removeItem.calledOnceWith(0, 1)).to.be.true;
        expect(player.getInventory().addItemAt.calledOnceWith(item, 1)).to.be.true;
        expect(publishSpy.calledTwice).to.be.true;
    });

    it('should send all items in the inventory', () => {
        const items = new Map([
            [
                0,
                {
                    getWindow: () => WindowTypeEnum.INVENTORY,
                    getPosition: () => 0,
                    getId: () => 1,
                    getCount: () => 1,
                    getFlags: () => ({ getFlag: () => 0 }),
                    getAntiFlags: () => ({ getFlag: () => 0 }),
                },
            ],
        ]);
        player.getInventory().getItems.returns(items);

        playerInventory.sendInventory();

        expect(
            publishSpy.calledWithMatch({
                window: WindowTypeEnum.INVENTORY,
                position: 0,
            }),
        ).to.be.true;
        expect(updateViewSpy.calledOnce).to.be.true;
    });
});
