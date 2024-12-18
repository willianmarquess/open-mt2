import { asClass, asFunction, asValue, createContainer } from 'awilix';
import AuthServer from './interface/server/AuthServer';
import LoginService from './app/service/LoginService';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { makePackets } from '@/core/interface/networking/packets/Packets';
import AccountRepository from '@/auth/infra/database/AccountRepository';
import BcryptEncryptionProvider from '@/core/infra/encryption/BcryptEncryptionProvider';
import RedisCacheProvider from '@/core/infra/cache/RedisCacheProvider';
import { makeAuthConfig } from './infra/config/AuthConfig';

const container = createContainer();

container.register({
    containerInstance: asValue(container),
    server: asClass(AuthServer).singleton(),
    logger: asClass(WinstonLoggerAdapter).singleton(),
    config: asFunction(makeAuthConfig).singleton(),
    packets: asFunction(makePackets).singleton(),
    databaseManager: asClass(DatabaseManager).singleton(),
    accountRepository: asClass(AccountRepository).scoped(),
    cacheProvider: asClass(RedisCacheProvider).singleton(),
    encryptionProvider: asClass(BcryptEncryptionProvider).singleton(),
    loginService: asClass(LoginService).scoped(),
});

export { container };
