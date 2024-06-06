import { expect } from 'chai';
import PacketHeaderEnum from '../../../../../../src/core/enum/PacketHeaderEnum.js';
import Packets from '../../../../../../src/core/interface/networking/packets/Packets.js';
import HandshakePacket from '../../../../../../src/core/interface/networking/packets/packet/bidirectional/HandshakePacket.js';
import HandshakePacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/HandshakePacketHandler.js';
import LoginRequestPacket from '../../../../../../src/core/interface/networking/packets/packet/in/LoginRequestPacket.js';
import LoginRequestPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/LoginRequestPacketHandler.js';
import ServerStatusRequestPacket from '../../../../../../src/core/interface/networking/packets/packet/in/ServerStatusRequestPacket.js';
import ServerStatusRequestPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/ServerStatusRequestPacketHandler.js';
import AuthTokenPacket from '../../../../../../src/core/interface/networking/packets/packet/in/AuthTokenPacket.js';
import AuthTokenPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/AuthTokenPacketHandler.js';
import EmpirePacket from '../../../../../../src/core/interface/networking/packets/packet/bidirectional/EmpirePacket.js';
import EmpirePacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/EmpirePacketHandler.js';
import CreateCharacterPacket from '../../../../../../src/core/interface/networking/packets/packet/in/CreateCharacterPacket.js';
import CreateCharacterPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/CreateCharacterPacketHandler.js';
import SelectCharacterPacket from '../../../../../../src/core/interface/networking/packets/packet/in/SelectCharacterPacket.js';
import SelectCharacterPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/SelectCharacterPacketHandler.js';
import ClientVersionPacket from '../../../../../../src/core/interface/networking/packets/packet/in/ClientVersionPacket.js';
import ClientVersionPacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/ClientVersionPacketHandler.js';
import EnterGamePacket from '../../../../../../src/core/interface/networking/packets/packet/in/EnterGamePacket.js';
import EnterGamePacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/EnterGamePacketHandler.js';
import CharacterMovePacket from '../../../../../../src/core/interface/networking/packets/packet/in/CharacterMovePacket.js';
import CharacterMovePacketHandler from '../../../../../../src/core/interface/networking/packets/handlers/CharacterMovePacketHandler.js';

describe('PacketHandlerMap', function () {
    let packetHandlerMap;

    beforeEach(function () {
        packetHandlerMap = Packets();
    });

    it('should create a map with correct handlers and packets for HANDSHAKE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.HANDSHAKE);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(HandshakePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(HandshakePacketHandler);
    });

    it('should create a map with correct handlers and packets for LOGIN_REQUEST', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.LOGIN_REQUEST);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(LoginRequestPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(LoginRequestPacketHandler);
    });

    it('should create a map with correct handlers and packets for SERVER_STATUS_REQUEST', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.SERVER_STATUS_REQUEST);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(ServerStatusRequestPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(ServerStatusRequestPacketHandler);
    });

    it('should create a map with correct handlers and packets for TOKEN', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.TOKEN);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(AuthTokenPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(AuthTokenPacketHandler);
    });

    it('should create a map with correct handlers and packets for EMPIRE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.EMPIRE);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(EmpirePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(EmpirePacketHandler);
    });

    it('should create a map with correct handlers and packets for CREATE_CHARACTER', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CREATE_CHARACTER);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(CreateCharacterPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(CreateCharacterPacketHandler);
    });

    it('should create a map with correct handlers and packets for SELECT_CHARACTER', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.SELECT_CHARACTER);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(SelectCharacterPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(SelectCharacterPacketHandler);
    });

    it('should create a map with correct handlers and packets for CLIENT_VERSION', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CLIENT_VERSION);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(ClientVersionPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(ClientVersionPacketHandler);
    });

    it('should create a map with correct handlers and packets for ENTER_GAME', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.ENTER_GAME);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(EnterGamePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(EnterGamePacketHandler);
    });

    it('should create a map with correct handlers and packets for CHARACTER_MOVE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CHARACTER_MOVE);
        expect(handlerFactory).to.exist;
        expect(handlerFactory.createPacket()).to.be.instanceOf(CharacterMovePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(CharacterMovePacketHandler);
    });
});
