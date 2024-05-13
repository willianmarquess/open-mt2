import { asClass, asFunction, asValue, createContainer } from 'awilix';
import AuthServer from './interface/server/AuthServer.js';
import Logger from '../core/infra/logger/Logger.js';
import Packets from '../core/interface/networking/packets/Packets.js';
import Config from '../core/infra/config/Config.js';
import DatabaseManager from '../core/infra/database/DatabaseManager.js';
import AccountRepository from './infra/database/AccountRepository.js';

const container = createContainer();

container.register({
    containerInstance: asValue(container),
    server: asClass(AuthServer).singleton(),
    logger: asFunction(Logger).singleton(),
    config: asFunction(Config).singleton(),
    packets: asFunction(Packets).singleton(),
    databaseManager: asClass(DatabaseManager).singleton(),
    accountRepository: asClass(AccountRepository).scoped(),
});

export { container };
