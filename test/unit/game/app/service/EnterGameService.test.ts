import Player from '@/core/domain/entities/game/player/Player';
import EnterGameService from '@/game/app/service/EnterGameService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('EnterGameService', function () {
    let worldMock;
    let enterGameService: EnterGameService;

    beforeEach(function () {
        worldMock = {
            spawn: sinon.spy(),
        };

        enterGameService = new EnterGameService({ world: worldMock });
    });

    describe('execute', function () {
        it('should spawn the player and send inventory', function () {
            const playerMock = {
                spawn: sinon.spy(),
                sendInventory: sinon.spy(),
            };

            enterGameService.execute(playerMock as unknown as Player);

            expect(playerMock.spawn.calledOnce).to.be.true;
            expect(worldMock.spawn.calledOnceWith(playerMock)).to.be.true;
            expect(playerMock.sendInventory.calledOnce).to.be.true;
        });
    });
});
