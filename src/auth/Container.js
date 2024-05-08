import { asClass, asFunction, createContainer } from 'awilix';
import AuthServer from './interface/AuthServer.js';
import Logger from '../core/infra/Logger.js';
import Config from './infra/config/Config.js';

const container = createContainer();

container.register({
    server: asClass(AuthServer).singleton(),
    logger: asFunction(Logger).singleton(),
    config: asFunction(Config).singleton(),
});

export { container };
