import ConnectionStatePackager from './ConnectionStatePackager.js';
import HandshakePackager from './HandshakePackager.js';

export default () => [new ConnectionStatePackager(), new HandshakePackager()];
