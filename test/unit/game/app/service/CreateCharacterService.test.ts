import { expect } from 'chai';
import sinon from 'sinon';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import CreateCharacterService, { MAX_PLAYERS_PER_ACCOUNT } from '@/game/app/service/CreateCharacterService';

describe('CreateCharacterService', function () {
    let loggerMock;
    let cacheProviderMock;
    let playerRepositoryMock;
    let entityManagerMock;
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
            getByAccountIdAndSlot: sinon.stub().resolves(null),
            create: sinon.stub(),
        };

        entityManagerMock = {
            createPlayer: sinon.stub(),
        };

        createCharacterService = new CreateCharacterService({
            logger: loggerMock,
            cacheProvider: cacheProviderMock,
            playerRepository: playerRepositoryMock,
            entityManager: entityManagerMock,
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
            playerRepositoryMock.getByAccountId.resolves(new Array(MAX_PLAYERS_PER_ACCOUNT));

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
            expect(playerRepositoryMock.create.called).to.be.false;
        });

        it('should still allow a character while the account is one short of full', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountId.resolves(new Array(MAX_PLAYERS_PER_ACCOUNT - 1));
            cacheProviderMock.exists.resolves(true);
            cacheProviderMock.get.resolves(2);
            entityManagerMock.createPlayer.returns({ toDatabase: sinon.stub().returns({}), setId: sinon.spy() });
            playerRepositoryMock.create.resolves(100);

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(result.hasError()).to.be.false;
        });

        it('should return error if the slot is already taken', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountIdAndSlot.resolves({ id: 1, slot: 1, name: 'occupant' });

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(playerRepositoryMock.getByAccountIdAndSlot.calledOnceWith(10, 1)).to.be.true;
            expect(result.hasError()).to.be.true;
            expect(result.getError()).to.equal(ErrorTypesEnum.SLOT_ALREADY_TAKEN);
            expect(playerRepositoryMock.create.called).to.be.false;
        });

        it('should refuse the occupied slot even when the account has room', async function () {
            playerRepositoryMock.nameAlreadyExists.resolves(false);
            playerRepositoryMock.getByAccountId.resolves([{ slot: 0 }]);
            playerRepositoryMock.getByAccountIdAndSlot.resolves({ id: 1, slot: 0, name: 'occupant' });

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 0,
                accountId: 10,
            });

            expect(result.getError()).to.equal(ErrorTypesEnum.SLOT_ALREADY_TAKEN);
            expect(playerRepositoryMock.create.called).to.be.false;
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

            entityManagerMock.createPlayer.returns(playerMock);
            playerRepositoryMock.create.resolves(100);

            const result = await createCharacterService.execute({
                playerName: 'newName',
                playerClass: 1,
                appearance: 123,
                slot: 1,
                accountId: 10,
            });

            expect(entityManagerMock.createPlayer.calledOnce).to.be.true;
            expect(playerRepositoryMock.create.calledOnce).to.be.true;
            expect(playerMock.setId.calledOnce).to.be.true;
            expect(result.hasError()).to.be.false;
            expect(result.getData()).to.equal(playerMock);
        });
    });
});
