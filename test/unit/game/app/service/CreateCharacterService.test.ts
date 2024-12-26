import { expect } from 'chai';
import sinon from 'sinon';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CreateCharacterService from '@/game/app/service/CreateCharacterService';

describe('CreateCharacterService', function () {
    let loggerMock;
    let cacheProviderMock;
    let playerRepositoryMock;
    let playerFactoryMock;
    let createCharacterService: CreateCharacterService;

    beforeEach(function () {
        loggerMock = {
            info: sinon.spy(),
        };

        cacheProviderMock = {
            exists: sinon.stub(),
            get: sinon.stub(),
        };

        playerRepositoryMock = {
            nameAlreadyExists: sinon.stub(),
            getByAccountId: sinon.stub(),
            create: sinon.stub(),
        };

        playerFactoryMock = {
            create: sinon.stub(),
        };

        createCharacterService = new CreateCharacterService({
            logger: loggerMock,
            cacheProvider: cacheProviderMock,
            playerRepository: playerRepositoryMock,
            playerFactory: playerFactoryMock,
        });
    });

    describe('execute', function () {
        it('should return error if the player name already exists', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(true);

            const result = await createCharacterService.execute({
                playerName: 'existingName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(playerRepositoryMock.nameAlreadyExists.calledOnce).to.be.true;
            expect(result.hasError()).to.be.true;
            expect(result.getError()).to.equal(ErrorTypesEnum.NAME_ALREADY_EXISTS);
        });

        it('should return error if the account is full', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountId.resolves(new Array(5));

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(playerRepositoryMock.getByAccountId.calledOnce).to.be.true;
            expect(result.hasError()).to.be.true;
            expect(result.getError()).to.equal(ErrorTypesEnum.ACCOUNT_FULL);
        });

        it('should return error if the empire is not selected', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountId.resolves([]);
            cacheProviderMock.exists.resolves(false);

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(cacheProviderMock.exists.calledOnce).to.be.true;
            expect(result.hasError()).to.be.true;
            expect(result.getError()).to.equal(ErrorTypesEnum.EMPIRE_NOT_SELECTED);
        });

        it('should create a player successfully', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountId.resolves([]);
            cacheProviderMock.exists.resolves(true);
            cacheProviderMock.get.resolves(2);

            const playerMock = {
                toDatabase: sinon.stub().returns({}),
                setId: sinon.spy(),
            };

            playerFactoryMock.create.returns(playerMock);
            playerRepositoryMock.create.resolves(100);

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(playerFactoryMock.create.calledOnce).to.be.true;
            expect(playerRepositoryMock.create.calledOnce).to.be.true;
            expect(playerMock.setId.calledOnce).to.be.true;
            expect(result.hasError()).to.be.false;
            expect(result.getData()).to.equal(playerMock);
        });
    });
});
