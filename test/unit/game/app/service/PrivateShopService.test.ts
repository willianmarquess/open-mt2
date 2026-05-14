import { expect } from 'chai';
import sinon from 'sinon';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import Player from '@/core/domain/entities/game/player/Player';
import PrivateShopService from '@/game/app/service/PrivateShopService';
import PrivateShop from '@/core/domain/shop/PrivateShop';
import { ShopSubHeaderGC } from '@/core/enum/ShopSubHeaderEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';

// ── helpers ──────────────────────────────────────────────────────────────────

const makeItem = (overrides: Partial<any> = {}) => ({
    getId: sinon.stub().returns(1001),
    getCount: sinon.stub().returns(1),
    getSize: sinon.stub().returns(1),
    getPosition: sinon.stub().returns(0),
    getWindow: sinon.stub().returns(0),
    getAntiFlags: sinon.stub().returns({ is: sinon.stub().returns(false) }),
    decreaseCount: sinon.stub(),
    ...overrides,
});

const makeInventory = (items: Map<number, any> = new Map()) => ({
    getItems: sinon.stub().returns(items),
    removeItem: sinon.stub(),
    addItemAt: sinon.stub(),
});

const makePlayer = (overrides: Partial<any> = {}): any => ({
    getName: sinon.stub().returns('TestPlayer'),
    getVirtualId: sinon.stub().returns(1),
    isRunningPrivateShop: sinon.stub().returns(false),
    getPrivateShop: sinon.stub().returns(null),
    setPrivateShop: sinon.stub(),
    getCurrentShop: sinon.stub().returns(null),
    setCurrentShop: sinon.stub(),
    getCurrentPrivateShopOwner: sinon.stub().returns(null),
    setCurrentPrivateShopOwner: sinon.stub(),
    getItem: sinon.stub().returns(null),
    getInventory: sinon.stub().returns(makeInventory()),
    addItem: sinon.stub().returns(true),
    getPoint: sinon.stub().returns(9999),
    addPoint: sinon.stub(),
    getNearbyEntities: sinon.stub().returns(new Map()),
    sendCurrentShop: sinon.stub(),
    sendShopClose: sinon.stub(),
    sendShopSign: sinon.stub(),
    sendShopUpdateItem: sinon.stub(),
    sendShopResult: sinon.stub(),
    sendItemRemoved: sinon.stub(),
    sendItemAdded: sinon.stub(),
    sendItemUpdate: sinon.stub(),
    ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('PrivateShopService', () => {
    let loggerStub;
    let itemManagerStub;
    let service: PrivateShopService;

    beforeEach(() => {
        loggerStub = sinon.createStubInstance(WinstonLoggerAdapter);
        itemManagerStub = {
            save: sinon.stub().resolves(),
            delete: sinon.stub().resolves(),
        };
        service = new PrivateShopService({ logger: loggerStub, itemManager: itemManagerStub });
    });

    afterEach(() => sinon.restore());

    // ── openPrivateShop ────────────────────────────────────────────────────────

    describe('openPrivateShop', () => {
        it('should do nothing if player already has a shop open', async () => {
            const player = makePlayer({ isRunningPrivateShop: sinon.stub().returns(true) });
            await service.openPrivateShop(player, 'Shop', []);
            expect(player.setPrivateShop.called).to.be.false;
        });

        it('should do nothing if player is browsing an NPC shop', async () => {
            const player = makePlayer({ getCurrentShop: sinon.stub().returns({}) });
            await service.openPrivateShop(player, 'Shop', []);
            expect(player.setPrivateShop.called).to.be.false;
        });

        it('should skip items not found in inventory', async () => {
            const player = makePlayer({ getItem: sinon.stub().returns(null) });
            const entries = [{ cellIndex: 0, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'Shop', entries);
            expect(player.setPrivateShop.called).to.be.false;
        });

        it('should skip items with ANTI_MYSHOP flag', async () => {
            const item = makeItem({
                getAntiFlags: sinon.stub().returns({ is: sinon.stub().returns(true) }),
            });
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            const entries = [{ cellIndex: 0, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'Shop', entries);
            expect(player.setPrivateShop.called).to.be.false;
        });

        // #6 – price validation
        it('should skip items with price = 0', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            const entries = [{ cellIndex: 0, displayPos: 0, price: 0, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'Shop', entries);
            expect(player.setPrivateShop.called).to.be.false;
        });

        it('should skip items with negative price', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            const entries = [{ cellIndex: 0, displayPos: 0, price: -50, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'Shop', entries);
            expect(player.setPrivateShop.called).to.be.false;
        });

        // #7 – price ceiling
        it('should clamp price to 2_000_000_000', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(makeInventory());

            const entries = [{ cellIndex: 0, displayPos: 0, price: 9_999_999_999, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'S', entries);

            const shop: PrivateShop = player.setPrivateShop.firstCall.args[0];
            expect(shop.getItemAtDisplaySlot(0)?.price).to.equal(2_000_000_000);
        });

        // #2 – duplicate slot rejection
        it('should skip entries with duplicate displayPos', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(makeInventory());

            // Two entries share displayPos=0 but different cellIndex
            const entries = [
                { cellIndex: 0, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 },
                { cellIndex: 1, displayPos: 0, price: 200, vnum: 1, count: 1, windowType: 1 },
            ];
            await service.openPrivateShop(player, 'S', entries);

            const shop: PrivateShop = player.setPrivateShop.firstCall.args[0];
            // Only one item should be in the shop
            expect(shop.getItemsAsArray().filter(Boolean)).to.have.lengthOf(1);
        });

        it('should skip entries with duplicate cellIndex', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(makeInventory());

            // Two entries share cellIndex=0 but different displayPos
            const entries = [
                { cellIndex: 0, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 },
                { cellIndex: 0, displayPos: 1, price: 200, vnum: 1, count: 1, windowType: 1 },
            ];
            await service.openPrivateShop(player, 'S', entries);

            const shop: PrivateShop = player.setPrivateShop.firstCall.args[0];
            expect(shop.getItemsAsArray().filter(Boolean)).to.have.lengthOf(1);
        });

        it('should create the shop and set it on the player', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            const inventory = makeInventory(new Map([[99, makeItem({ getId: sinon.stub().returns(50200) })]]));
            player.getInventory.returns(inventory);

            const entries = [{ cellIndex: 5, displayPos: 2, price: 500, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'MyShop', entries);

            expect(player.setPrivateShop.calledOnce).to.be.true;
            const shop: PrivateShop = player.setPrivateShop.firstCall.args[0];
            expect(shop).to.be.instanceOf(PrivateShop);
            expect(shop.getSign()).to.equal('MyShop');
        });

        it('should broadcast the shop sign after opening', async () => {
            const item = makeItem();
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(makeInventory());

            const entries = [{ cellIndex: 5, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'S', entries);

            expect(player.sendShopSign.calledOnce).to.be.true;
        });

        // #1 – bundle consumption (last in stack → delete)
        it('should delete the Bundle if it is the last one in the stack', async () => {
            const item = makeItem();
            const bundle = makeItem({
                getId: sinon.stub().returns(50200),
                getCount: sinon.stub().returns(1),
                getSize: sinon.stub().returns(1),
            });
            bundle.getPosition = sinon.stub().returns(3);
            bundle.getWindow = sinon.stub().returns(0);

            const inventoryMap = new Map<number, any>([[3, bundle]]);
            const inventory = makeInventory(inventoryMap);
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(inventory);

            const entries = [{ cellIndex: 5, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'S', entries);

            expect(inventory.removeItem.calledWith(3, 1)).to.be.true;
            expect(player.sendItemRemoved.calledOnce).to.be.true;
            expect(itemManagerStub.delete.calledOnceWith(bundle)).to.be.true;
        });

        // #1 – bundle consumption (stacked → decrement count)
        it('should decrement count when Bundle stack has more than one', async () => {
            const item = makeItem();
            const bundle = makeItem({
                getId: sinon.stub().returns(50200),
                getCount: sinon.stub().returns(5),
                getSize: sinon.stub().returns(1),
            });

            const inventoryMap = new Map<number, any>([[3, bundle]]);
            const inventory = makeInventory(inventoryMap);
            const player = makePlayer({ getItem: sinon.stub().returns(item) });
            player.getInventory.returns(inventory);

            const entries = [{ cellIndex: 5, displayPos: 0, price: 100, vnum: 1, count: 1, windowType: 1 }];
            await service.openPrivateShop(player, 'S', entries);

            expect(bundle.decreaseCount.calledWith(1)).to.be.true;
            expect(player.sendItemUpdate.calledOnceWith(bundle)).to.be.true;
            expect(itemManagerStub.save.calledOnceWith(bundle)).to.be.true;
            expect(itemManagerStub.delete.called).to.be.false;
            expect(inventory.removeItem.called).to.be.false;
        });
    });

    // ── closePrivateShop ───────────────────────────────────────────────────────

    describe('closePrivateShop', () => {
        it('should do nothing if player has no shop', async () => {
            const player = makePlayer();
            await service.closePrivateShop(player);
            expect(player.sendShopClose.called).to.be.false;
        });

        it('should kick all guests and clear their owner reference', async () => {
            const guest1 = makePlayer();
            const guest2 = makePlayer();
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            shop.addGuest(guest1);
            shop.addGuest(guest2);

            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });
            owner.getNearbyEntities.returns(new Map());

            await service.closePrivateShop(owner);

            expect(guest1.setCurrentPrivateShopOwner.calledWith(null)).to.be.true;
            expect(guest1.sendShopClose.calledOnce).to.be.true;
            expect(guest2.setCurrentPrivateShopOwner.calledWith(null)).to.be.true;
            expect(guest2.sendShopClose.calledOnce).to.be.true;
        });

        it('should clear the shop on the owner and send SHOP_END', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });
            owner.getNearbyEntities.returns(new Map());

            await service.closePrivateShop(owner);

            expect(owner.setPrivateShop.calledWith(null)).to.be.true;
            expect(owner.sendShopClose.calledOnce).to.be.true;
        });

        it('should broadcast an empty sign to nearby players', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const nearby = sinon.createStubInstance(Player);
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });
            owner.getNearbyEntities.returns(new Map([[1, nearby]]));

            await service.closePrivateShop(owner);

            expect(owner.sendShopSign.calledWithMatch({ sign: '' })).to.be.true;
            expect(nearby.sendShopSign.calledWithMatch({ sign: '' })).to.be.true;
        });
    });

    // ── openShopForOwner ───────────────────────────────────────────────────────

    describe('openShopForOwner', () => {
        it('should do nothing if owner has no shop', async () => {
            const owner = makePlayer();
            await service.openShopForOwner(owner);
            expect(owner.sendCurrentShop.called).to.be.false;
        });

        it('should send the shop listing to the owner', async () => {
            const item = makeItem();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 1, price: 200, item: item as any }],
            });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });

            await service.openShopForOwner(owner);

            expect(owner.sendCurrentShop.calledOnce).to.be.true;
            const args = owner.sendCurrentShop.firstCall.args[0];
            expect(args.ownerVid).to.equal(owner.getVirtualId());
        });
    });

    // ── openShopForGuest ───────────────────────────────────────────────────────

    describe('openShopForGuest', () => {
        it('should do nothing if owner has no shop', async () => {
            const guest = makePlayer();
            const owner = makePlayer();
            await service.openShopForGuest(guest, owner);
            expect(guest.sendCurrentShop.called).to.be.false;
        });

        it('should do nothing if guest is running their own shop', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const guest = makePlayer({ isRunningPrivateShop: sinon.stub().returns(true) });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });

            await service.openShopForGuest(guest, owner);

            expect(guest.sendCurrentShop.called).to.be.false;
        });

        it('should close any existing NPC shop the guest has open', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const npcShop = {};
            const guest = makePlayer({ getCurrentShop: sinon.stub().returns(npcShop) });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });

            await service.openShopForGuest(guest, owner);

            expect(guest.setCurrentShop.calledWith(null)).to.be.true;
            expect(guest.sendShopClose.calledOnce).to.be.true;
        });

        it('should close previous private shop session when switching to a different owner', async () => {
            const prevShop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const prevOwner = makePlayer({ getPrivateShop: sinon.stub().returns(prevShop) });

            const newShop = new PrivateShop({ owner: {} as any, sign: 'S2', items: [] });
            const guest = makePlayer({ getCurrentPrivateShopOwner: sinon.stub().returns(prevOwner) });
            const newOwner = makePlayer({ getPrivateShop: sinon.stub().returns(newShop) });

            await service.openShopForGuest(guest, newOwner);

            expect(guest.setCurrentPrivateShopOwner.calledWith(null)).to.be.true;
            expect(guest.sendShopClose.calledOnce).to.be.true;
        });

        // #3 – no sendShopClose when re-clicking the same shop
        it('should not send SHOP_END when re-clicking the same owner shop', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });
            // Guest is already browsing this owner
            const guest = makePlayer({ getCurrentPrivateShopOwner: sinon.stub().returns(owner) });

            await service.openShopForGuest(guest, owner);

            expect(guest.sendShopClose.called).to.be.false;
        });

        it('should add the guest and send the shop listing', async () => {
            const item = makeItem();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 1, inventoryPos: 0, price: 300, item: item as any }],
            });
            const guest = makePlayer();
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });

            await service.openShopForGuest(guest, owner);

            expect(shop.hasGuest(guest)).to.be.true;
            expect(guest.setCurrentPrivateShopOwner.calledWith(owner)).to.be.true;
            expect(guest.sendCurrentShop.calledOnce).to.be.true;
        });
    });

    // ── buy ───────────────────────────────────────────────────────────────────

    describe('buy', () => {
        it('should send INVALID_POS if guest has no current private shop owner', async () => {
            const guest = makePlayer();
            await service.buy(guest, 0);
            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.INVALID_POS })).to.be.true;
        });

        it('should close guest session if owner shop is gone', async () => {
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(null) });
            const guest = makePlayer({ getCurrentPrivateShopOwner: sinon.stub().returns(owner) });

            await service.buy(guest, 0);

            expect(guest.setCurrentPrivateShopOwner.calledWith(null)).to.be.true;
            expect(guest.sendShopClose.calledOnce).to.be.true;
        });

        it('should send INVALID_POS if display slot is empty', async () => {
            const shop = new PrivateShop({ owner: {} as any, sign: 'S', items: [] });
            const owner = makePlayer({ getPrivateShop: sinon.stub().returns(shop) });
            const guest = makePlayer({ getCurrentPrivateShopOwner: sinon.stub().returns(owner) });

            await service.buy(guest, 5);

            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.INVALID_POS })).to.be.true;
        });

        it('should send NOT_ENOUGH_MONEY if guest cannot afford item', async () => {
            const item = makeItem();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 0, price: 1000, item: item as any }],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                getPoint: sinon.stub().returns(50),
            });

            await service.buy(guest, 0);

            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.NOT_ENOUGH_MONEY })).to.be.true;
        });

        it('should send SOLD_OUT if item no longer in owner inventory', async () => {
            const item = makeItem();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 0, price: 100, item: item as any }],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(null),
            });
            const guest = makePlayer({ getCurrentPrivateShopOwner: sinon.stub().returns(owner) });

            await service.buy(guest, 0);

            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.SOLD_OUT })).to.be.true;
            expect(shop.getItemAtDisplaySlot(0)).to.be.undefined;
        });

        it('should rollback and send INVENTORY_FULL if guest cannot hold item', async () => {
            const item = makeItem();
            const inventory = makeInventory();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 2, price: 100, item: item as any }],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
                getInventory: sinon.stub().returns(inventory),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                addItem: sinon.stub().returns(false),
            });

            await service.buy(guest, 0);

            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.INVENTORY_FULL })).to.be.true;
            // Rollback: item restored to owner
            expect(inventory.addItemAt.calledWith(item, 2)).to.be.true;
            expect(owner.sendItemAdded.calledOnce).to.be.true;
        });

        it('should transfer yang, save item, and send OK on success', async () => {
            const item = makeItem();
            const inventory = makeInventory();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 2, price: 500, item: item as any }],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
                getInventory: sinon.stub().returns(inventory),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                getPoint: sinon.stub().returns(1000),
                addItem: sinon.stub().returns(true),
            });

            await service.buy(guest, 0);

            expect(guest.addPoint.calledWith(PointsEnum.GOLD, -500)).to.be.true;
            expect(owner.addPoint.calledWith(PointsEnum.GOLD, 500)).to.be.true;
            expect(itemManagerStub.save.calledOnceWith(item)).to.be.true;
            expect(guest.sendShopResult.calledWith({ result: ShopSubHeaderGC.OK })).to.be.true;
        });

        it('should keep buyer in guest set and not close their shop UI after purchase', async () => {
            const item = makeItem();
            const item2 = makeItem({ getId: sinon.stub().returns(1002) });
            const inventory = makeInventory();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [
                    { displayPos: 0, inventoryPos: 2, price: 100, item: item as any },
                    { displayPos: 1, inventoryPos: 3, price: 200, item: item2 as any },
                ],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
                getInventory: sinon.stub().returns(inventory),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                addItem: sinon.stub().returns(true),
            });
            shop.addGuest(guest);

            await service.buy(guest, 0);

            expect(shop.hasGuest(guest)).to.be.true;
            expect(guest.setCurrentPrivateShopOwner.calledWith(null)).to.be.false;
            expect(guest.sendShopClose.called).to.be.false;
        });

        it('should remove the sold slot from the shop and notify remaining guests', async () => {
            const item = makeItem();
            const inventory = makeInventory();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 3, inventoryPos: 2, price: 100, item: item as any }],
            });
            const otherGuest = makePlayer();
            shop.addGuest(otherGuest);

            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
                getInventory: sinon.stub().returns(inventory),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                addItem: sinon.stub().returns(true),
            });

            await service.buy(guest, 3);

            expect(shop.getItemAtDisplaySlot(3)).to.be.undefined;
            expect(otherGuest.sendShopUpdateItem.calledWith({ pos: 3 })).to.be.true;
        });

        it('should auto-close the shop when the last item is sold', async () => {
            const item = makeItem();
            const inventory = makeInventory();
            const shop = new PrivateShop({
                owner: {} as any,
                sign: 'S',
                items: [{ displayPos: 0, inventoryPos: 0, price: 100, item: item as any }],
            });
            const owner = makePlayer({
                getPrivateShop: sinon.stub().returns(shop),
                getItem: sinon.stub().returns(item),
                getInventory: sinon.stub().returns(inventory),
            });
            const guest = makePlayer({
                getCurrentPrivateShopOwner: sinon.stub().returns(owner),
                addItem: sinon.stub().returns(true),
            });

            await service.buy(guest, 0);

            // Shop is empty → closePrivateShop called → owner gets SHOP_END
            expect(owner.setPrivateShop.calledWith(null)).to.be.true;
            expect(owner.sendShopClose.calledOnce).to.be.true;
        });
    });
});
