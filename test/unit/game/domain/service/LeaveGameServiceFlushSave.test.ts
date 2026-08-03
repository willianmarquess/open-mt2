import { expect } from 'chai';
import sinon from 'sinon';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import Player from '@/core/domain/entities/game/player/Player';

describe('LeaveGameService (issue #149)', () => {
    it('awaits the player flush save before despawning, so the caller observes a completed save', async () => {
        const order: Array<string> = [];

        const player = {
            flushSave: async () => {
                order.push('flush:start');
                await new Promise((resolve) => setImmediate(resolve));
                order.push('flush:done');
            },
            getCurrentPrivateShopOwner: () => null,
        };

        const world = { despawn: () => order.push('despawn') };
        const privateShopService = { closePrivateShop: sinon.stub().resolves() };
        const questManager = { onLogout: sinon.stub().resolves() };

        const service = new LeaveGameService({
            world: world as any,
            privateShopService: privateShopService as any,
            questManager: questManager as any,
        } as any);

        await service.execute(player as unknown as Player);

        expect(order).to.deep.equal(['flush:start', 'flush:done', 'despawn']);
    });
});
