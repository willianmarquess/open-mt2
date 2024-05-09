import { asClass, asFunction, createContainer } from 'awilix';
import AuthServer from './interface/AuthServer.js';
import Logger from '../core/infra/logger/Logger.js';
import Packets from '../core/networking/packets/Packets.js';
import Config from '../core/infra/config/Config.js';
import DatabaseManager from '../core/infra/database/DatabaseManager.js';

const container = createContainer();

container.register({
    server: asClass(AuthServer).singleton(),
    logger: asFunction(Logger).singleton(),
    config: asFunction(Config).singleton(),
    packets: asFunction(Packets).singleton(),
    databaseManager: asClass(DatabaseManager).singleton(),
});

export { container };
