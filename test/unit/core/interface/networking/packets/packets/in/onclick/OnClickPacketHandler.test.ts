import { expect } from 'chai';
import sinon from 'sinon';
import OnClickPacketHandler from '@/core/interface/networking/packets/packet/in/onclick/OnClickPacketHandler';
import GameConnection from '@/game/interface/networking/GameConnection';

/**
 * Regression for issue #102: the handler resolved the clicked entity from a
 * world-wide virtual-id lookup and dispatched with no positional check, so a
 * crafted virtual id reached QuestManager.onClick and ShopManager.openShop
 * from any distance and any map.
 */
describe('OnClickPacketHandler range gate (issue #102)', () => {
    const AREA_A = { id: 'a' };
    const AREA_B = { id: 'b' };

    let questManager: any;
    let shopManager: any;
    let entityManager: any;
    let logger: any;
    let handler: OnClickPacketHandler;

    const target = ({ area = AREA_A, x = 100, y = 100 } = {}) => ({
        getArea: () => area,
        getPositionX: () => x,
        getPositionY: () => y,
        getId: () => 20001,
        getVirtualId: () => 77,
    });

    const connectionWith = (player: any) =>
        ({ getPlayer: () => player, close: sinon.spy() }) as unknown as GameConnection;

    const player = ({ area = AREA_A, x = 100, y = 100 } = {}) => ({
        getArea: () => area,
        getPositionX: () => x,
        getPositionY: () => y,
        getName: () => 'clicker',
    });

    const packet = () => ({ isValid: () => true, getTargetVirtualId: () => 77 }) as any;

    beforeEach(() => {
        questManager = { onClick: sinon.stub().resolves(false) };
        shopManager = { openShop: sinon.stub().resolves() };
        entityManager = { getEntity: sinon.stub() };
        logger = { error: sinon.spy(), info: sinon.spy(), debug: sinon.spy() };
        handler = new OnClickPacketHandler({ logger, questManager, shopManager, entityManager });
    });

    it('should dispatch a click on a target standing next to the player', async () => {
        entityManager.getEntity.returns(target({ x: 150, y: 150 }));

        await handler.execute(connectionWith(player()), packet());

        expect(questManager.onClick.calledOnce, 'the quest path runs').to.equal(true);
        expect(shopManager.openShop.calledOnce, 'and the shop path follows it').to.equal(true);
    });

    it('should refuse a click on a target in another area', async () => {
        entityManager.getEntity.returns(target({ area: AREA_B, x: 100, y: 100 }));

        await handler.execute(connectionWith(player({ area: AREA_A })), packet());

        expect(questManager.onClick.called, 'no quest state is advanced across maps').to.equal(false);
        expect(shopManager.openShop.called, 'and no shop is opened across maps').to.equal(false);
    });

    it('should refuse a click from beyond the view radius', async () => {
        entityManager.getEntity.returns(target({ x: 100_000, y: 100_000 }));

        await handler.execute(connectionWith(player({ x: 100, y: 100 })), packet());

        expect(questManager.onClick.called).to.equal(false);
        expect(shopManager.openShop.called).to.equal(false);
    });

    it('should still allow a click at the edge of the view radius', async () => {
        entityManager.getEntity.returns(target({ x: 100 + 7_999, y: 100 }));

        await handler.execute(connectionWith(player({ x: 100, y: 100 })), packet());

        expect(questManager.onClick.calledOnce, 'an honest client can hold this virtual id').to.equal(true);
    });
});
