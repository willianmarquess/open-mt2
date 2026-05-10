import { expect } from 'chai';
import sinon from 'sinon';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import ShopManager from '@/core/domain/shop/ShopManager';
import Shop from '@/core/domain/shop/Shop';
import ItemManager from '@/core/domain/manager/ItemManager';
import { makeGameConfig } from '@/game/infra/config/GameConfig';

describe('ShopManager', () => {
    let loggerStub;
    let itemManagerStub;
    let manager: ShopManager;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        itemManagerStub = {
            getItem: sinon.stub().returns({ getShopPrice: () => 100 }),
        };
        manager = new ShopManager({
            config: makeGameConfig(),
            logger: loggerStub,
            itemManager: itemManagerStub as unknown as ItemManager,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize with empty shops', () => {
        expect(manager.hasShop(9001)).to.be.false;
    });

    it('should load shops from npc_shop.json', () => {
        // Mock itemManager.getItem to return valid items
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 100,
        });

        manager.load();

        // Verify shops are loaded
        expect(manager.hasShop(9001)).to.be.true;
        expect(manager.hasShop(9002)).to.be.true;
        expect(manager.hasShop(9012)).to.be.true;
    });

    it('should return correct shop for valid NPC vnum', () => {
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 100,
        });

        manager.load();

        const shop = manager.getShop(9001);
        expect(shop).to.be.instanceOf(Shop);
        expect(shop.getShopName()).to.equal('Arms');
    });

    it('should return undefined for invalid NPC vnum', () => {
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 100,
        });

        manager.load();

        const shop = manager.getShop(9999);
        expect(shop).to.be.undefined;
    });

    it('should indicate shop exists for loaded NPCs', () => {
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 100,
        });

        manager.load();

        expect(manager.hasShop(9001)).to.be.true;
        expect(manager.hasShop(9999)).to.be.false;
    });

    it('should load all expected shops', () => {
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 100,
        });

        manager.load();

        const expectedNpcs = [9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012];
        expectedNpcs.forEach((npcVnum) => {
            expect(manager.hasShop(npcVnum)).to.be.true;
        });
    });

    it('should load shop items correctly', () => {
        itemManagerStub.getItem = sinon.stub().returns({
            getShopPrice: () => 500,
        });

        manager.load();

        const shop = manager.getShop(9001);
        const items = shop.getItems();
        expect(items.length).to.be.greaterThan(0);
        expect(items[0]).to.have.property('vnum');
        expect(items[0]).to.have.property('count');
    });
});
