import { expect } from 'chai';
import sinon from 'sinon';
import CharacterMovePacketHandler from '@/core/interface/networking/packets/packet/in/characterMove/CharacterMovePacketHandler';

describe('CharacterMovePacketHandler', () => {
    let loggerMock, characterMoveServiceMock, connectionMock, packetMock;
    let characterMovePacketHandler: CharacterMovePacketHandler;

    beforeEach(() => {
        loggerMock = {
            error: sinon.spy(),
            info: sinon.spy(),
        };

        characterMoveServiceMock = {
            execute: sinon.stub(),
        };

        connectionMock = {
            close: sinon.spy(),
            getPlayer: () => ({ id: 1, name: 'TestPlayer' }),
        };

        packetMock = {
            isValid: sinon.stub(),
            getErrorMessage: () => sinon.stub(),
            getMovementType: () => 'RUN',
            getPositionX: () => 100,
            getPositionY: () => 200,
            getArg: () => 1,
            getRotation: () => 0.5,
            getTime: () => 123456789,
        };

        characterMovePacketHandler = new CharacterMovePacketHandler({
            logger: loggerMock,
            characterMoveService: characterMoveServiceMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should log an error and close the connection if the packet is invalid', async () => {
        packetMock.isValid.returns(false);
        packetMock.getErrorMessage = () => ['Invalid packet format'];

        await characterMovePacketHandler.execute(connectionMock, packetMock);

        expect(loggerMock.error.calledWith('[CharacterMovePacketHandler] Packet invalid')).to.be.true;
        expect(loggerMock.error.calledWith(['Invalid packet format'])).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should log an info message and close the connection if there is no player in the connection', async () => {
        packetMock.isValid.returns(true);
        connectionMock.getPlayer = () => null;

        await characterMovePacketHandler.execute(connectionMock, packetMock);

        expect(
            loggerMock.info.calledWith(
                '[CharacterMovePacketHandler] The connection does not have an player select, this cannot happen',
            ),
        ).to.be.true;
        expect(connectionMock.close.calledOnce).to.be.true;
    });

    it('should call characterMoveService with correct parameters when packet is valid and player exists', async () => {
        packetMock.isValid.returns(true);

        await characterMovePacketHandler.execute(connectionMock, packetMock);

        expect(characterMoveServiceMock.execute.calledOnce).to.be.true;
        expect(
            characterMoveServiceMock.execute.calledWith({
                player: connectionMock.getPlayer(),
                movementType: 'RUN',
                positionX: 100,
                positionY: 200,
                arg: 1,
                rotation: 0.5,
                time: 123456789,
            }),
        ).to.be.true;
    });
});
