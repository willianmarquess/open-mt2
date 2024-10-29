import { expect } from 'chai';
import sinon from 'sinon';
import CreateCharacterPacketHandler from '../../../../../../../../../src/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacketHandler.js';
import ErrorTypesEnum from '../../../../../../../../../src/core/enum/ErrorTypesEnum.js';
import CreateCharacterFailurePacket from '../../../../../../../../../src/core/interface/networking/packets/packet/out/CreateCharacterFailurePacket.js';
import CreateCharacterSuccessPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/out/CreateCharacterSuccessPacket.js';

describe('CreateCharacterPacketHandler', function () {
    let createCharacterPacketHandler, mockConnection, mockLogger, mockConfig, mockCreateCharacterService;

    beforeEach(function () {
        mockLogger = { error: sinon.spy(), info: sinon.spy() };
        mockConnection = { send: sinon.spy(), close: sinon.spy(), accountId: 123 };
        mockConfig = { SERVER_PORT: 8080, SERVER_ADDRESS: '127.0.0.1' };
        mockCreateCharacterService = { execute: sinon.stub() };

        createCharacterPacketHandler = new CreateCharacterPacketHandler({
            createCharacterService: mockCreateCharacterService,
            logger: mockLogger,
            config: mockConfig,
        });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should close connection if packet is invalid', async function () {
        const invalidPacket = { isValid: () => false, errors: () => ['Invalid data'] };
        await createCharacterPacketHandler.execute(mockConnection, invalidPacket);

        expect(mockConnection.close.calledOnce).to.be.true;
        expect(mockLogger.error.calledWith('[CreateCharacterPacketHandler] Packet invalid')).to.be.true;
    });

    it('should send CreateCharacterFailurePacket if name already exists', async function () {
        const validPacket = {
            isValid: () => true,
            playerName: 'test',
            playerClass: 1,
            appearance: 'appearance',
            slot: 0,
        };

        mockCreateCharacterService.execute.resolves({
            hasError: () => true,
            error: ErrorTypesEnum.NAME_ALREADY_EXISTS,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.send.calledOnce).to.be.true;
        const sentPacket = mockConnection.send.getCall(0).args[0];
        expect(sentPacket).to.be.instanceOf(CreateCharacterFailurePacket);
    });

    it('should close connection if account is full', async function () {
        const validPacket = {
            isValid: () => true,
            playerName: 'test',
            playerClass: 1,
            appearance: 'appearance',
            slot: 0,
        };

        mockCreateCharacterService.execute.resolves({
            hasError: () => true,
            error: ErrorTypesEnum.ACCOUNT_FULL,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.close.calledOnce).to.be.true;
    });

    it('should send CreateCharacterSuccessPacket with correct data on success', async function () {
        const validPacket = {
            isValid: () => true,
            playerName: 'test',
            playerClass: 1,
            appearance: 'appearance',
            slot: 0,
        };

        const mockPlayer = {
            name: 'test',
            playerClass: 1,
            bodyPart: 'body',
            hairPart: 'hair',
            level: 1,
            skillGroup: 'skills',
            playTime: 100,
            id: 1,
            positionX: 100,
            positionY: 200,
            ht: 10,
            st: 10,
            dx: 10,
            iq: 10,
        };

        mockCreateCharacterService.execute.resolves({
            hasError: () => false,
            data: mockPlayer,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.send.calledOnce).to.be.true;
        const sentPacket = mockConnection.send.getCall(0).args[0];
        expect(sentPacket).to.be.instanceOf(CreateCharacterSuccessPacket);
    });
});
