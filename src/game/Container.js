import { asClass, asFunction, asValue, createContainer } from 'awilix';
import GameServer from './interface/server/GameServer.js';
import Logger from '../core/infra/logger/Logger.js';
import Packets from '../core/interface/networking/packets/Packets.js';
import DatabaseManager from '../core/infra/database/DatabaseManager.js';
import Config from './infra/config/Config.js';
import CacheProvider from '../core/infra/cache/CacheProvider.js';
import World from '../core/domain/World.js';
import PlayerRepository from './infra/database/PlayerRepository.js';
import CreateCharacterService from './app/service/CreateCharacterService.js';
import LoadCharactersService from './app/service/LoadCharactersService.js';
import SelectEmpireService from './app/service/SelectEmpireService.js';
import PlayerFactory from '../core/domain/factories/PlayerFactory.js';
import SelectCharacterService from './app/service/SelectCharacterService.js';
import AuthenticateService from './domain/service/AuthenticateService.js';
import EnterGameService from './app/service/EnterGameService.js';
import SpawnCharacterService from './domain/service/SpawnCharacterService.js';

const container = createContainer();

container.register({
    containerInstance: asValue(container),
    server: asClass(GameServer).singleton(),
    logger: asFunction(Logger).singleton(),
    config: asFunction(Config).singleton(),
    packets: asFunction(Packets).singleton(),
    databaseManager: asClass(DatabaseManager).singleton(),
    world: asClass(World).singleton(),
    cacheProvider: asClass(CacheProvider).singleton(),
    playerRepository: asClass(PlayerRepository).singleton(),
    authenticateService: asClass(AuthenticateService).scoped(),
    createCharacterService: asClass(CreateCharacterService).scoped(),
    loadCharactersService: asClass(LoadCharactersService).scoped(),
    selectEmpireService: asClass(SelectEmpireService).scoped(),
    selectCharacterService: asClass(SelectCharacterService).scoped(),
    playerFactory: asClass(PlayerFactory).scoped(),
    enterGameService: asClass(EnterGameService).scoped(),
    spawnCharacterService: asClass(SpawnCharacterService).scoped(),
});

export { container };
