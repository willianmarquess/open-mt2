import { expect } from 'chai';
import sinon from 'sinon';
import LoadCharactersService from '@/game/app/service/LoadCharactersService';

describe('LoadCharactersService', function () {
    let playerRepositoryMock;
    let loadCharactersService: LoadCharactersService;

    beforeEach(function () {
        playerRepositoryMock = {
            getByAccountId: sinon.stub(),
        };

        loadCharactersService = new LoadCharactersService({ playerRepository: playerRepositoryMock });
    });

    describe('execute', function () {
        it('should return players for the given accountId', async function () {
            const accountId = 'test-account-id';
            const players = [];
            playerRepositoryMock.getByAccountId.resolves(players);

            const result = await loadCharactersService.execute({ accountId });

            expect(playerRepositoryMock.getByAccountId.calledOnceWith(accountId)).to.be.true;
            expect(result.hasError()).to.be.false;
            expect(result.getData()).to.equal(players);
        });

        it('should handle no players found', async function () {
            const accountId = 'test-account-id';
            playerRepositoryMock.getByAccountId.resolves([]);

            const result = await loadCharactersService.execute({ accountId });

            expect(playerRepositoryMock.getByAccountId.calledOnceWith(accountId)).to.be.true;
            expect(result.hasError()).to.be.false;
            expect(result.getData()).to.be.an('array').that.is.empty;
        });
    });
});
