import { expect } from 'chai';
import sinon from 'sinon';
import AuthTokenPacketHandler from '../../../../../../../../../src/core/interface/networking/packets/packet/in/authToken/AuthTokenPacketHandler';
import EmpirePacket from '../../../../../../../../../src/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';
import CharactersInfoPacket from '../../../../../../../../../src/core/interface/networking/packets/packet/out/CharactersInfoPacket';
import ConnectionStateEnum from '../../../../../../../../../src/core/enum/ConnectionStateEnum';

describe('AuthTokenPacketHandler', () => {
    let loadCharactersServiceMock, authenticateServiceMock, configMock, loggerMock;
    let connectionMock, packetMock, authTokenPacketHandler;

    beforeEach(() => {
        loadCharactersServiceMock = { execute: sinon.stub() };
        authenticateServiceMock = { execute: sinon.stub() };
        configMock = { SERVER_PORT: 12345, SERVER_ADDRESS: '127.0.0.1' };
        loggerMock = { error: sinon.spy() };

        connectionMock = {
            close: sinon.spy(),
            send: sinon.spy(),
            accountId: null,
            state: null,
        };

        packetMock = {
            isValid: sinon.stub(),
            errors: sinon.stub(),
            key: 'test-key',
            username: 'test-user',
        };

        authTokenPacketHandler = new AuthTokenPacketHandler({
            loadCharactersService: loadCharactersServiceMock,
            authenticateService: authenticateServiceMock,
            config: configMock,
            logger: loggerMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should close connection and log error if packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.errors.returns(['Invalid packet data']);

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[AuthTokenPacketHandler] Packet invalid')).to.be.true;
        expect(loggerMock.error.calledWith(['Invalid packet data'])).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should close connection if authentication fails', async () => {
        packetMock.isValid.returns(true);
        authenticateServiceMock.execute.resolves({ hasError: () => true });

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should set connection accountId and send EmpirePacket if authentication succeeds and characters exist', async () => {
        packetMock.isValid.returns(true);
        authenticateServiceMock.execute.resolves({
            hasError: () => false,
            data: { accountId: 1 },
        });

        const charactersData = [
            {
                slot: 0,
                name: 'Hero',
                playerClass: 'Warrior',
                bodyPart: 1,
                hairPart: 2,
                level: 10,
                skillGroup: 1,
                playTime: 500,
                empire: 2,
                positionX: 100,
                positionY: 200,
                ht: 50,
                st: 60,
                dx: 70,
                iq: 80,
                id: 12345,
            },
        ];

        loadCharactersServiceMock.execute.resolves({
            isOk: () => true,
            data: charactersData,
        });

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(connectionMock.accountId).to.equal(1);
        expect(connectionMock.send.calledTwice).to.be.true;

        // Check EmpirePacket was sent
        const empirePacket = connectionMock.send.getCall(0).args[0];
        expect(empirePacket).to.be.instanceOf(EmpirePacket);
        expect(empirePacket.empireId).to.equal(2);

        // Check CharactersInfoPacket was sent
        const characterInfoPacket = connectionMock.send.getCall(1).args[0];
        expect(characterInfoPacket).to.be.instanceOf(CharactersInfoPacket);
        expect(characterInfoPacket.characters).to.have.lengthOf(4);

        const characterData = characterInfoPacket.characters[0];
        expect(characterData.name).to.equal('Hero');
        expect(characterData.playerClass).to.equal('Warrior');
        expect(characterData.positionX).to.equal(100);
        expect(characterData.positionY).to.equal(200);
        expect(characterData.ht).to.equal(50);
        expect(characterData.st).to.equal(60);
    });

    it('should set connection state to SELECT after execution', async () => {
        packetMock.isValid.returns(true);
        authenticateServiceMock.execute.resolves({
            hasError: () => false,
            data: { accountId: 1 },
        });

        loadCharactersServiceMock.execute.resolves({
            isOk: () => false, // No characters
        });

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(connectionMock.state).to.equal(ConnectionStateEnum.SELECT);
    });
});
