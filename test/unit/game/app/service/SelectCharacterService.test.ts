import { expect } from 'chai';
import sinon from 'sinon';
import SelectCharacterService from '@/game/app/service/SelectCharacterService';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';

describe('SelectCharacterService', () => {
    let selectCharacterService: SelectCharacterService;
    let playerRepositoryStub;
    let loggerStub;
    let playerFactoryStub;
    let worldStub;
    let itemManagerStub;

    beforeEach(() => {
        playerRepositoryStub = {
            getByAccountIdAndSlot: sinon.stub(),
        };
        loggerStub = {
            info: sinon.stub(),
        };
        playerFactoryStub = {
            create: sinon.stub(),
        };
        worldStub = {
            generateVirtualId: sinon.stub(),
        };
        itemManagerStub = {
            getItems: sinon.stub(),
        };

        selectCharacterService = new SelectCharacterService({
            playerRepository: playerRepositoryStub,
            logger: loggerStub,
            playerFactory: playerFactoryStub,
            world: worldStub,
            itemManager: itemManagerStub,
        });
    });

    it('should return PLAYER_NOT_FOUND error if player is not found', async () => {
        playerRepositoryStub.getByAccountIdAndSlot.resolves(null);

        const result = await selectCharacterService.execute(1, 123);

        expect(result.hasError()).to.be.true;
        expect(result.getError()).to.equal(ErrorTypesEnum.PLAYER_NOT_FOUND);
        expect(loggerStub.info.calledOnce).to.be.true;
    });

    it('should return player if found', async () => {
        const playerData = {
            id: 1,
            name: 'testPlayer',
            setVirtualId: sinon.spy(),
            getId: () => 1,
        };
        playerRepositoryStub.getByAccountIdAndSlot.resolves(playerData);
        playerFactoryStub.create.returns(playerData);
        worldStub.generateVirtualId.returns(100);
        itemManagerStub.getItems.resolves([]);

        const result = await selectCharacterService.execute(1, 123);

        expect(result.isOk()).to.be.true;
        expect(result.getData().getId()).to.equal(playerData.id);
        expect(worldStub.generateVirtualId.calledOnce).to.be.true;
        expect(itemManagerStub.getItems.calledOnce).to.be.true;
        expect(playerData.setVirtualId.calledOnceWith(100)).to.be.true;
    });
});
