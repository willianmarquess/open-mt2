import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import EmpirePacket from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';
import EmpirePacketHandler from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacketHandler';
import HandshakePacket from '@/core/interface/networking/packets/packet/bidirectional/handshake/HandshakePacket';
import HandshakePacketHandler from '@/core/interface/networking/packets/packet/bidirectional/handshake/HandshakePacketHandler';
import AuthTokenPacket from '@/core/interface/networking/packets/packet/in/authToken/AuthTokenPacket';
import AuthTokenPacketHandler from '@/core/interface/networking/packets/packet/in/authToken/AuthTokenPacketHandler';
import CharacterMovePacket from '@/core/interface/networking/packets/packet/in/characterMove/CharacterMovePacket';
import CharacterMovePacketHandler from '@/core/interface/networking/packets/packet/in/characterMove/CharacterMovePacketHandler';
import ClientVersionPacket from '@/core/interface/networking/packets/packet/in/clientVersion/ClientVersionPacket';
import ClientVersionPacketHandler from '@/core/interface/networking/packets/packet/in/clientVersion/ClientVersionPacketHandler';
import CreateCharacterPacket from '@/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacket';
import CreateCharacterPacketHandler from '@/core/interface/networking/packets/packet/in/createCharacter/CreateCharacterPacketHandler';
import EnterGamePacket from '@/core/interface/networking/packets/packet/in/enterGame/EnterGamePacket';
import EnterGamePacketHandler from '@/core/interface/networking/packets/packet/in/enterGame/EnterGamePacketHandler';
import LoginRequestPacket from '@/core/interface/networking/packets/packet/in/loginRequest/LoginRequestPacket';
import LoginRequestPacketHandler from '@/core/interface/networking/packets/packet/in/loginRequest/LoginRequestPacketHandler';
import SelectCharacterPacket from '@/core/interface/networking/packets/packet/in/selectCharacter/SelectCharacterPacket';
import SelectCharacterPacketHandler from '@/core/interface/networking/packets/packet/in/selectCharacter/SelectCharacterPacketHandler';
import ServerStatusRequestPacket from '@/core/interface/networking/packets/packet/in/serverStatus/ServerStatusRequestPacket';
import ServerStatusRequestPacketHandler from '@/core/interface/networking/packets/packet/in/serverStatus/ServerStatusRequestPacketHandler';
import { makePackets, PacketMapValue } from '@/core/interface/networking/packets/Packets';
import { expect } from 'chai';

describe('PacketHandlerMap', function () {
    let packetHandlerMap: Map<number, PacketMapValue<any>>;

    beforeEach(function () {
        packetHandlerMap = makePackets();
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
        expect(handlerFactory.createPacket({})).to.be.instanceOf(CharacterMovePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(CharacterMovePacketHandler);
    });
});
