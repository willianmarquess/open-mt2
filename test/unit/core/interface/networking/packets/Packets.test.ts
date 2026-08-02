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
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import { expect } from 'chai';

describe('PacketHandlerMap', function () {
    let packetHandlerMap: Map<number, PacketMapValue<any>>;

    beforeEach(function () {
        packetHandlerMap = makePackets();
    });

    it('should create a map with correct handlers and packets for HANDSHAKE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.HANDSHAKE);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(HandshakePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(HandshakePacketHandler);
    });

    it('should create a map with correct handlers and packets for LOGIN_REQUEST', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.LOGIN_REQUEST);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(LoginRequestPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(LoginRequestPacketHandler);
    });

    it('should create a map with correct handlers and packets for SERVER_STATUS_REQUEST', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.SERVER_STATUS_REQUEST);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(ServerStatusRequestPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(ServerStatusRequestPacketHandler);
    });

    it('should create a map with correct handlers and packets for TOKEN', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.TOKEN);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(AuthTokenPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(AuthTokenPacketHandler);
    });

    it('should create a map with correct handlers and packets for EMPIRE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.EMPIRE);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(EmpirePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(EmpirePacketHandler);
    });

    it('should create a map with correct handlers and packets for CREATE_CHARACTER', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CREATE_CHARACTER);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(CreateCharacterPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(CreateCharacterPacketHandler);
    });

    it('should create a map with correct handlers and packets for SELECT_CHARACTER', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.SELECT_CHARACTER);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(SelectCharacterPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(SelectCharacterPacketHandler);
    });

    it('should create a map with correct handlers and packets for CLIENT_VERSION', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CLIENT_VERSION);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(ClientVersionPacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(ClientVersionPacketHandler);
    });

    it('should create a map with correct handlers and packets for ENTER_GAME', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.ENTER_GAME);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket()).to.be.instanceOf(EnterGamePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(EnterGamePacketHandler);
    });

    it('should create a map with correct handlers and packets for CHARACTER_MOVE', function () {
        const handlerFactory = packetHandlerMap.get(PacketHeaderEnum.CHARACTER_MOVE);
        expect(handlerFactory).to.exist;
        if (!handlerFactory) throw new Error('Expected handlerFactory to be defined');
        expect(handlerFactory.createPacket({})).to.be.instanceOf(CharacterMovePacket);
        expect(handlerFactory.createHandler({})).to.be.instanceOf(CharacterMovePacketHandler);
    });

    describe('phase gate (issue #123)', function () {
        const LOGIN_ONLY = [
            PacketHeaderEnum.TOKEN,
            PacketHeaderEnum.EMPIRE,
            PacketHeaderEnum.CREATE_CHARACTER,
            PacketHeaderEnum.DELETE_CHARACTER,
            PacketHeaderEnum.SELECT_CHARACTER,
            PacketHeaderEnum.ENTER_GAME,
        ];

        const GAME_ONLY = [
            PacketHeaderEnum.ATTACK,
            PacketHeaderEnum.CHAT_IN,
            PacketHeaderEnum.ITEM_USE,
            PacketHeaderEnum.ITEM_MOVE,
            PacketHeaderEnum.ITEM_DROP,
            PacketHeaderEnum.ITEM_PICKUP,
            PacketHeaderEnum.ON_CLICK,
            PacketHeaderEnum.SHOP_IN,
            PacketHeaderEnum.PLAYER_SHOP_IN,
        ];

        const phasesOf = (header: number) => packetHandlerMap.get(header)!.phases;

        it('should give every registered packet a phase it is reachable in', function () {
            for (const [header, packet] of packetHandlerMap) {
                expect(packet.phases, `header ${header} declares its phases`).to.not.be.equal(undefined);
                expect(packet.phases.size, `header ${header} is reachable somewhere`).to.be.greaterThan(0);
            }
        });

        it('should keep login packets out of the game phases', function () {
            for (const header of LOGIN_ONLY) {
                expect(phasesOf(header).has(ConnectionStateEnum.GAME), `header ${header} in GAME`).to.be.equal(false);
                expect(phasesOf(header).has(ConnectionStateEnum.DEAD), `header ${header} in DEAD`).to.be.equal(false);
            }
        });

        it('should keep gameplay packets out of the login phases', function () {
            for (const header of GAME_ONLY) {
                expect(phasesOf(header).has(ConnectionStateEnum.SELECT), `header ${header} in SELECT`).to.be.equal(
                    false,
                );
                expect(phasesOf(header).has(ConnectionStateEnum.LOADING), `header ${header} in LOADING`).to.be.equal(
                    false,
                );
            }
        });

        it('should let keepalive through in every phase', function () {
            for (const header of [PacketHeaderEnum.PONG, PacketHeaderEnum.INTERNAL_PING]) {
                expect(phasesOf(header).has(ConnectionStateEnum.SELECT), `header ${header} in SELECT`).to.be.equal(
                    true,
                );
                expect(phasesOf(header).has(ConnectionStateEnum.GAME), `header ${header} in GAME`).to.be.equal(true);
            }
        });

        it('should keep movement out of the phases where the character is not in the world yet', function () {
            const move = phasesOf(PacketHeaderEnum.CHARACTER_MOVE);

            expect(move.has(ConnectionStateEnum.GAME), 'move in GAME').to.be.equal(true);
            expect(move.has(ConnectionStateEnum.SELECT), 'move in SELECT').to.be.equal(false);
            expect(move.has(ConnectionStateEnum.LOADING), 'move in LOADING').to.be.equal(false);
        });

        it('should dispatch nothing on a closing connection', function () {
            for (const [header, packet] of packetHandlerMap) {
                expect(packet.phases.has(ConnectionStateEnum.CLOSE), `header ${header} in CLOSE`).to.be.equal(false);
            }
        });
    });
});
