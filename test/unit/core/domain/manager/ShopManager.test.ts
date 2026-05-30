import { expect } from 'chai';
import sinon from 'sinon';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import ShopService from '@/game/app/service/ShopService';
import Shop from '@/core/domain/shop/Shop';
import ItemManager from '@/core/domain/manager/ItemManager';
import { makeGameConfig } from '@/game/infra/config/GameConfig';

describe('ShopManager', () => {
    let loggerStub: sinon.SinonStubbedInstance<WinstonLoggerAdapter>;
    let itemManagerStub: sinon.SinonStubbedInstance<ItemManager>;
    let service: ShopService;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        itemManagerStub = sinon.createStubInstance(ItemManager);
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);
        service = new ShopService({
            config: makeGameConfig(),
            logger: loggerStub,
            itemManager: itemManagerStub,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize with empty shops', () => {
        expect(service.hasShop(9001)).to.be.false;
    });

    it('should load shops from npc_shop.json', () => {
        // Mock itemManager.getItem to return valid items
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);

        service.load();

        // Verify shops are loaded
        expect(service.hasShop(9001)).to.be.true;
        expect(service.hasShop(9002)).to.be.true;
        expect(service.hasShop(9012)).to.be.true;
    });

    it('should return correct shop for valid NPC vnum', () => {
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);

        service.load();

        const shop = service.getShop(9001);
        expect(shop).to.be.instanceOf(Shop);
        if (shop) {
            expect(shop.getShopName()).to.equal('Arms');
        }
    });

    it('should return undefined for invalid NPC vnum', () => {
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);

        service.load();

        const shop = service.getShop(9999);
        expect(shop).to.be.undefined;
    });

    it('should indicate shop exists for loaded NPCs', () => {
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);

        service.load();

        expect(service.hasShop(9001)).to.be.true;
        expect(service.hasShop(9999)).to.be.false;
    });

    it('should load all expected shops', () => {
        itemManagerStub.getItem.returns({ getShopPrice: () => 100, getSize: () => 1 } as any);

        service.load();

        const expectedNpcs = makeGameConfig().npcShops.map((shopEntry) => shopEntry.npcVnum);
        expectedNpcs.forEach((npcVnum) => {
            expect(service.hasShop(npcVnum)).to.be.true;
        });
    });

    it('should load shop items correctly', () => {
        itemManagerStub.getItem.returns({ getShopPrice: () => 500, getSize: () => 1 } as any);

        service.load();

        const shop = service.getShop(9001);
        expect(shop).to.not.be.undefined;
        if (shop) {
            const items = shop.getItems();
            expect(items.length).to.be.greaterThan(0);
            expect(items[0]).to.have.property('vnum');
            expect(items[0]).to.have.property('count');
        }
    });
});
