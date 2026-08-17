import LeaveGameService from '@/game/domain/service/LeaveGameService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('LeaveGameService', function () {
    let world: any;
    let privateShopService: any;
    let questManager: any;
    let playerMock: any;
    let leaveGameService: LeaveGameService;

    beforeEach(function () {
        world = { despawn: sinon.spy() };
        privateShopService = { closePrivateShop: sinon.stub().resolves() };
        questManager = { onLogout: sinon.stub().resolves() };
        playerMock = {
            getCurrentPrivateShopOwner: () => null,
            setCurrentPrivateShopOwner: sinon.spy(),
            flushSave: sinon.stub().resolves(),
        };

        leaveGameService = new LeaveGameService({ world, privateShopService, questManager });
    });

    describe('execute', function () {
        it('should run the quest logout hook for the player who is leaving', async function () {
            await leaveGameService.execute(playerMock);

            expect(questManager.onLogout.calledOnceWith(playerMock)).to.be.equal(true);
        });

        it('should run the quest logout hook before the player leaves the world', async function () {
            await leaveGameService.execute(playerMock);

            expect(questManager.onLogout.calledBefore(world.despawn)).to.be.equal(true);
        });

        it('should run the quest logout hook before the save is flushed', async function () {
            await leaveGameService.execute(playerMock);

            expect(
                questManager.onLogout.calledBefore(playerMock.flushSave),
                'a LOGOUT quest handler that changes player state must be persisted, not dropped',
            ).to.be.equal(true);
        });
    });
});
