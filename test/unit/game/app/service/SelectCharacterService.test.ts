import { expect } from 'chai';
import sinon from 'sinon';
import SelectCharacterService from '@/game/app/service/SelectCharacterService';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

describe('SelectCharacterService', () => {
    let selectCharacterService: SelectCharacterService;
    let playerRepositoryStub;
    let loggerStub;
    let itemManagerStub;
    let connectionStub;
    let entityManagerStub: any;

    beforeEach(() => {
        playerRepositoryStub = {
            getByAccountIdAndSlot: sinon.stub(),
        };
        loggerStub = {
            info: sinon.stub(),
        };
        itemManagerStub = {
            getItems: sinon.stub(),
        };
        connectionStub = {
            setPlayer: sinon.stub(),
        };
        entityManagerStub = {
            createPlayer: sinon.stub(),
        };

        selectCharacterService = new SelectCharacterService({
            playerRepository: playerRepositoryStub,
            logger: loggerStub,
            itemManager: itemManagerStub,
            entityManager: entityManagerStub,
        });
    });

    it('should return PLAYER_NOT_FOUND error if player is not found', async () => {
        playerRepositoryStub.getByAccountIdAndSlot.resolves(null);

        const result = await selectCharacterService.execute(1, 123, connectionStub);

        expect(result.hasError()).to.be.true;
        expect(result.getError()).to.equal(ErrorTypesEnum.PLAYER_NOT_FOUND);
        expect(loggerStub.info.calledOnce).to.be.true;
        expect(connectionStub.setPlayer.calledOnce).to.be.false;
    });

    it('should return player if found', async () => {
        const playerData = {
            id: 1,
            name: 'testPlayer',
            setVirtualId: sinon.spy(),
            getId: () => 1,
            sendDetails: sinon.spy(),
            addItems: sinon.spy(),
            sendPoints: sinon.spy(),
            sendSkillLevel: sinon.spy(),
        };
        playerRepositoryStub.getByAccountIdAndSlot.resolves(playerData);
        entityManagerStub.createPlayer.returns(playerData);
        itemManagerStub.getItems.resolves([]);

        const result = await selectCharacterService.execute(1, 123, connectionStub);

        expect(result.isOk()).to.be.true;
        expect(result.getData()).to.exist;
        expect(result.getData()!.getId()).to.equal(playerData.id);
        expect(itemManagerStub.getItems.calledOnce).to.be.true;
        expect(connectionStub.setPlayer.calledOnce).to.be.true;
    });
});
