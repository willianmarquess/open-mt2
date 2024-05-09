export default class LoginRequestPacketHandler {
    async execute(connection, packet) {
        console.log(packet.username);
    }
}
