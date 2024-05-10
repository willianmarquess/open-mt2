export default class LoginRequestPacketHandler {
    async execute(connection, packet) {
        console.log('LOGIN >>>', packet.username);
        console.log('PASS >>>', packet.password);
        console.log('KEY >>>', packet.key);
    }
}
