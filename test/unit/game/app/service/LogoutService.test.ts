import Player from '@/core/domain/entities/game/player/Player';
import LogoutService from '@/game/app/service/LogoutService';
import { expect } from 'chai';
import sinon from 'sinon';

describe('LogoutService', function () {
    let leaveGameServiceMock;
    let logoutService: LogoutService;

    beforeEach(function () {
        leaveGameServiceMock = {
            execute: sinon.stub(),
        };

        logoutService = new LogoutService({ leaveGameService: leaveGameServiceMock });
    });

    describe('execute', function () {
        it('should call leaveGameService.execute with the player', async function () {
            const playerMock = sinon.createStubInstance(Player);

            await logoutService.execute(playerMock as unknown as Player);

            expect(leaveGameServiceMock.execute.calledOnceWith(playerMock)).to.be.true;
        });
    });
});
