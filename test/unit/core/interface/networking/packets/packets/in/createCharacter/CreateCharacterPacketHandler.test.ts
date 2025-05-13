import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import CreateCharacterPacketHandler from '@/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacketHandler';
import CreateCharacterFailurePacket from '@/core/interface/networking/packets/packet/out/CreateCharacterFailurePacket';
import CreateCharacterSuccessPacket from '@/core/interface/networking/packets/packet/out/CreateCharacterSuccessPacket';
import { expect } from 'chai';
import sinon from 'sinon';

describe('CreateCharacterPacketHandler', function () {
    let createCharacterPacketHandler: CreateCharacterPacketHandler,
        mockConnection,
        mockLogger,
        mockConfig,
        mockCreateCharacterService;

    beforeEach(function () {
        mockLogger = { error: sinon.spy(), info: sinon.spy() };
        mockConnection = { send: sinon.spy(), close: sinon.spy(), getAccountId: () => 123 };
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
        const invalidPacket = { isValid: () => false, getErrorMessage: () => ['Invalid data'] } as any;
        await createCharacterPacketHandler.execute(mockConnection, invalidPacket);

        expect(mockConnection.close.calledOnce).to.be.true;
        expect(mockLogger.error.calledWith('[CreateCharacterPacketHandler] Packet invalid')).to.be.true;
    });

    it('should send CreateCharacterFailurePacket if name already exists', async function () {
        const validPacket = {
            isValid: () => true,
            getPlayerName: () => 'test',
            getPlayerClass: () => 1,
            getAppearance: () => 'appearance',
            getSlot: () => 0,
        } as any;

        mockCreateCharacterService.execute.resolves({
            hasError: () => true,
            getError: () => ErrorTypesEnum.NAME_ALREADY_EXISTS,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.send.calledOnce).to.be.true;
        const sentPacket = mockConnection.send.getCall(0).args[0];
        expect(sentPacket).to.be.instanceOf(CreateCharacterFailurePacket);
    });

    it('should close connection if account is full', async function () {
        const validPacket = {
            isValid: () => true,
            getPlayerName: () => 'test',
            getPlayerClass: () => 1,
            getAppearance: () => 'appearance',
            getSlot: () => 0,
        } as any;

        mockCreateCharacterService.execute.resolves({
            hasError: () => true,
            getError: () => ErrorTypesEnum.ACCOUNT_FULL,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.close.calledOnce).to.be.true;
    });

    it('should send CreateCharacterSuccessPacket with correct data on success', async function () {
        const validPacket = {
            isValid: () => true,
            getPlayerName: () => 'test',
            getPlayerClass: () => 1,
            getAppearance: () => 'appearance',
            getSlot: () => 0,
        } as any;

        const mockPlayer = {
            getName: () => 'test',
            getPlayerClass: () => 1,
            getBodyPart: () => 'body',
            getHairPart: () => 'hair',
            getSkillGroup: () => 'skills',
            getId: () => 1,
            getPositionX: () => 100,
            getPositionY: () => 200,
            getPoint: (point: PointsEnum) => {
                switch (point) {
                    case PointsEnum.HT:
                    case PointsEnum.ST:
                    case PointsEnum.IQ:
                    case PointsEnum.DX:
                        return 10;
                    case PointsEnum.PLAY_TIME:
                        return 100;
                    case PointsEnum.LEVEL:
                        return 1;
                }
            },
        };

        mockCreateCharacterService.execute.resolves({
            hasError: () => false,
            getData: () => mockPlayer,
        });

        await createCharacterPacketHandler.execute(mockConnection, validPacket);

        expect(mockConnection.send.calledOnce).to.be.true;
        const sentPacket = mockConnection.send.getCall(0).args[0];
        expect(sentPacket).to.be.instanceOf(CreateCharacterSuccessPacket);
    });
});
