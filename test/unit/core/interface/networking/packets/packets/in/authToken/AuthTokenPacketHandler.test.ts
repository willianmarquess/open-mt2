import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import EmpirePacket from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';
import AuthTokenPacketHandler from '@/core/interface/networking/packets/packet/in/authToken/AuthTokenPacketHandler';
import CharactersInfoPacket from '@/core/interface/networking/packets/packet/out/CharactersInfoPacket';
import { expect } from 'chai';
import sinon from 'sinon';

describe('AuthTokenPacketHandler', () => {
    let loadCharactersServiceMock, authenticateServiceMock, sessionManagerMock, configMock, loggerMock;
    let connectionMock, packetMock, authTokenPacketHandler: AuthTokenPacketHandler;

    beforeEach(() => {
        loadCharactersServiceMock = { execute: sinon.stub() };
        authenticateServiceMock = { execute: sinon.stub() };
        sessionManagerMock = { get: sinon.stub().returns(undefined), set: sinon.spy(), remove: sinon.spy() };
        configMock = { SERVER_PORT: 12345, SERVER_ADDRESS: '127.0.0.1' };
        loggerMock = { error: sinon.spy(), info: sinon.spy() };

        connectionMock = {
            close: sinon.spy(),
            closeGracefully: sinon.spy(),
            send: sinon.spy(),
            getAccountId: () => 1,
            state: null,
            getState: () => connectionMock.state,
            setState: (value) => {
                connectionMock.state = value;
            },
            setAccountId: () => {},
        };

        packetMock = {
            isValid: sinon.stub(),
            getErrorMessage: sinon.stub(),
            getKey: () => 'test-key',
            getUsername: () => 'test-user',
        };

        authTokenPacketHandler = new AuthTokenPacketHandler({
            loadCharactersService: loadCharactersServiceMock,
            authenticateService: authenticateServiceMock,
            sessionManager: sessionManagerMock,
            config: configMock,
            logger: loggerMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should close connection and log error if packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.getErrorMessage.returns(['Invalid packet data']);

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
            getData: () => ({ accountId: 1 }),
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
            getData: () => charactersData,
        });

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(connectionMock.getAccountId()).to.equal(1);
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
            getData: () => ({ accountId: 1 }),
        });

        loadCharactersServiceMock.execute.resolves({
            isOk: () => false, // No characters
        });

        await authTokenPacketHandler.execute(connectionMock, packetMock);

        expect(connectionMock.state).to.equal(ConnectionStateEnum.SELECT);
    });

    describe('single session per account (issue #105)', () => {
        const authenticateAs = (accountId: number) => {
            packetMock.isValid.returns(true);
            authenticateServiceMock.execute.resolves({
                hasError: () => false,
                getData: () => ({ accountId }),
            });
            loadCharactersServiceMock.execute.resolves({ isOk: () => false });
        };

        it('should register the session when the account is not connected', async () => {
            authenticateAs(1);

            await authTokenPacketHandler.execute(connectionMock, packetMock);

            expect(sessionManagerMock.set.calledOnceWith(1, connectionMock)).to.equal(true);
        });

        it('should refuse the newcomer and kick the live session when the account is already connected', async () => {
            authenticateAs(1);
            const liveConnection = { close: sinon.spy() };
            sessionManagerMock.get.returns(liveConnection);

            await authTokenPacketHandler.execute(connectionMock, packetMock);

            expect(liveConnection.close.calledOnce, 'the ghost session is dropped').to.equal(true);
            expect(connectionMock.closeGracefully.calledOnce, 'the newcomer is refused').to.equal(true);
            expect(connectionMock.state, 'and never reaches character selection').to.not.equal(
                ConnectionStateEnum.SELECT,
            );
            expect(sessionManagerMock.set.called, 'no session is registered for a refused connection').to.equal(false);
        });

        it('should tell the refused client why, before closing', async () => {
            authenticateAs(1);
            sessionManagerMock.get.returns({ close: sinon.spy() });

            await authTokenPacketHandler.execute(connectionMock, packetMock);

            expect(connectionMock.send.calledOnce).to.equal(true);
            const sent = connectionMock.send.firstCall.args[0];
            expect(sent['status'], 'the stock client renders this status').to.equal('ALREADY');
            expect(
                connectionMock.close.called,
                'close() destroys the socket and would discard the packet still corked',
            ).to.equal(false);
        });

        it('should not load characters for a refused connection', async () => {
            authenticateAs(1);
            sessionManagerMock.get.returns({ close: sinon.spy() });

            await authTokenPacketHandler.execute(connectionMock, packetMock);

            expect(loadCharactersServiceMock.execute.called).to.equal(false);
        });
    });
});
