import { expect } from 'chai';
import sinon from 'sinon';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import ShopManager from '@/core/domain/shop/ShopManager';
import Shop from '@/core/domain/shop/Shop';
import { ShopItem } from '@/core/domain/shop/ShopItem';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

describe('ShopService', () => {
    let loggerStub;
    let shopManagerStub;
    let itemManagerStub;
    let manager: ShopManager;
    let playerStub;
    let npcStub;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        shopManagerStub = { getShop: sinon.stub(), hasShop: sinon.stub() };
        itemManagerStub = { getItem: sinon.stub(), save: sinon.stub().resolves(), delete: sinon.stub().resolves() };

        manager = new ShopManager({
            logger: loggerStub,
            shopService: shopManagerStub,
            itemManager: itemManagerStub,
            privateShopService: {} as any,
        });

        playerStub = {
            getName: sinon.stub().returns('TestPlayer'),
            setCurrentShop: sinon.stub(),
            getCurrentShop: sinon.stub(),
            getCurrentPrivateShopOwner: sinon.stub().returns(null),
            getPoint: sinon.stub(),
            addPoint: sinon.stub(),
            addItem: sinon.stub(),
            getItem: sinon.stub(),
            getInventory: sinon.stub(),
            sendItemRemoved: sinon.stub(),
            sendCurrentShop: sinon.stub(),
            sendShopClose: sinon.stub(),
            sendShopResult: sinon.stub(),
        };

        npcStub = {
            getId: sinon.stub().returns(9001),
            getVirtualId: sinon.stub().returns(1),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('openShop', () => {
        it('should open shop and send ShopStartPacket', async () => {
            const items: ShopItem[] = [
                { vnum: 1000, count: 1, price: 100, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            ];
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
            shopManagerStub.getShop.returns(shop);

            await manager.openShop(playerStub, npcStub);

            expect(playerStub.setCurrentShop.calledOnceWith(shop)).to.be.true;
            expect(playerStub.sendCurrentShop.calledOnce).to.be.true;
        });

        it('should not open shop if NPC has no shop', async () => {
            shopManagerStub.getShop.returns(undefined);

            await manager.openShop(playerStub, npcStub);

            expect(playerStub.setCurrentShop.called).to.be.false;
            expect(playerStub.sendCurrentShop.called).to.be.false;
        });
    });

    describe('closeShop', () => {
        it('should close shop and send ShopEndPacket', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            playerStub.getCurrentShop.returns(shop);

            await manager.closeShop(playerStub);

            expect(playerStub.setCurrentShop.calledOnceWith(null)).to.be.true;
            expect(playerStub.sendShopClose.calledOnce).to.be.true;
        });

        it('should do nothing if player has no open shop', async () => {
            playerStub.getCurrentShop.returns(null);

            await manager.closeShop(playerStub);

            expect(playerStub.setCurrentShop.called).to.be.false;
            expect(playerStub.sendShopClose.called).to.be.false;
        });
    });

    describe('buy', () => {
        it('should not buy if player has no open shop', async () => {
            playerStub.getCurrentShop.returns(null);

            await manager.buy(playerStub, 0);

            expect(playerStub.addPoint.called).to.be.false;
            expect(playerStub.sendShopResult.called).to.be.false;
        });

        it('should send INVALID_POS if slot is empty', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            playerStub.getCurrentShop.returns(shop);

            await manager.buy(playerStub, 5);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.INVALID_POS })).to.be.true;
        });

        it('should send NOT_ENOUGH_MONEY if player cannot afford item', async () => {
            const items: ShopItem[] = [
                { vnum: 1000, count: 1, price: 5000, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            ];
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
            playerStub.getCurrentShop.returns(shop);
            playerStub.getPoint.withArgs(PointsEnum.GOLD).returns(100);

            await manager.buy(playerStub, 0);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.NOT_ENOUGH_MONEY })).to.be.true;
            expect(playerStub.addPoint.called).to.be.false;
        });

        it('should send SOLD_OUT if itemManager cannot create item', async () => {
            const items: ShopItem[] = [
                { vnum: 1000, count: 1, price: 100, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            ];
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
            playerStub.getCurrentShop.returns(shop);
            playerStub.getPoint.withArgs(PointsEnum.GOLD).returns(1000);
            itemManagerStub.getItem.returns(null);

            await manager.buy(playerStub, 0);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.SOLD_OUT })).to.be.true;
        });

        it('should send INVENTORY_FULL if player cannot add item', async () => {
            const items: ShopItem[] = [
                { vnum: 1000, count: 1, price: 100, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            ];
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
            const mockItem = { getSize: () => 1 };
            playerStub.getCurrentShop.returns(shop);
            playerStub.getPoint.withArgs(PointsEnum.GOLD).returns(1000);
            itemManagerStub.getItem.returns(mockItem);
            playerStub.addItem.returns(false);

            await manager.buy(playerStub, 0);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.INVENTORY_FULL })).to.be.true;
            expect(playerStub.addPoint.called).to.be.false;
        });

        it('should deduct gold and send OK on successful buy', async () => {
            const items: ShopItem[] = [
                { vnum: 1000, count: 1, price: 200, item: { getSize: () => 1 } as any, size: 1, position: 0 },
            ];
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items });
            const mockItem = {};
            playerStub.getCurrentShop.returns(shop);
            playerStub.getPoint.withArgs(PointsEnum.GOLD).returns(500);
            itemManagerStub.getItem.returns(mockItem);
            playerStub.addItem.returns(true);

            await manager.buy(playerStub, 0);

            expect(playerStub.addPoint.calledOnceWith(PointsEnum.GOLD, -200)).to.be.true;
            expect(itemManagerStub.save.calledOnceWith(mockItem)).to.be.true;
            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.OK })).to.be.true;
        });
    });

    describe('sell', () => {
        it('should not sell if player has no open shop', async () => {
            playerStub.getCurrentShop.returns(null);

            await manager.sell(playerStub, 1, 1);

            expect(playerStub.addPoint.called).to.be.false;
        });

        it('should send INVALID_POS if item not found in inventory', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            playerStub.getCurrentShop.returns(shop);
            playerStub.getItem.returns(null);

            await manager.sell(playerStub, 1, 1);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.INVALID_POS })).to.be.true;
        });

        it('should send INVALID_POS if item has ANTI_SELL flag', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            const mockItem = {
                getAntiFlags: () => ({ is: () => true }),
                getCount: () => 1,
                getSize: () => 1,
                getShopPrice: () => 500,
            };
            playerStub.getCurrentShop.returns(shop);
            playerStub.getItem.returns(mockItem);

            await manager.sell(playerStub, 1, 1);

            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.INVALID_POS })).to.be.true;
            expect(playerStub.addPoint.called).to.be.false;
        });

        it('should calculate sell price as floor(shop_price * count / 5)', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            const inventoryStub = { removeItem: sinon.stub() };
            const mockItem = {
                getAntiFlags: () => ({ is: () => false }),
                getCount: () => 3,
                getSize: () => 1,
                getShopPrice: () => 500,
            };
            playerStub.getCurrentShop.returns(shop);
            playerStub.getItem.returns(mockItem);
            playerStub.getInventory.returns(inventoryStub);

            await manager.sell(playerStub, 1, 3);

            // sell price = floor(500 * 3 / 5) = 300
            expect(playerStub.addPoint.calledOnceWith(PointsEnum.GOLD, 300)).to.be.true;
        });

        it('should remove item and send OK on successful sell', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            const inventoryStub = { removeItem: sinon.stub() };
            const mockItem = {
                getAntiFlags: () => ({ is: () => false }),
                getCount: () => 1,
                getSize: () => 1,
                getShopPrice: () => 500,
            };
            playerStub.getCurrentShop.returns(shop);
            playerStub.getItem.returns(mockItem);
            playerStub.getInventory.returns(inventoryStub);

            await manager.sell(playerStub, 2, 1);

            expect(inventoryStub.removeItem.calledOnceWith(2, 1)).to.be.true;
            expect(playerStub.sendItemRemoved.calledOnce).to.be.true;
            expect(itemManagerStub.delete.calledOnceWith(mockItem)).to.be.true;
            expect(playerStub.sendShopResult.calledOnceWith({ result: ShopSubHeaderGC.OK })).to.be.true;
        });

        it('should cap sell count to item count', async () => {
            const shop = new Shop({ npcVnum: 9001, shopName: 'Arms', items: [] });
            const inventoryStub = { removeItem: sinon.stub() };
            const mockItem = {
                getAntiFlags: () => ({ is: () => false }),
                getCount: () => 2, // only 2 available
                getSize: () => 1,
                getShopPrice: () => 500,
            };
            playerStub.getCurrentShop.returns(shop);
            playerStub.getItem.returns(mockItem);
            playerStub.getInventory.returns(inventoryStub);

            await manager.sell(playerStub, 1, 10); // trying to sell 10, but only 2 available

            // sell price = floor(500 * 2 / 5) = 200
            expect(playerStub.addPoint.calledOnceWith(PointsEnum.GOLD, 200)).to.be.true;
        });
    });
});
