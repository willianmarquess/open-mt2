import PlayerFactory from '@/core/domain/factories/PlayerFactory';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import DropManager from '@/core/domain/manager/DropManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import ItemManager from '@/core/domain/manager/ItemManager';
import MobManager from '@/core/domain/manager/MobManager';
import SpawnManager from '@/core/domain/manager/SpawnManager';
import ItemCache from '@/core/domain/util/ItemCache';
import World from '@/core/domain/World';
import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { makePackets } from '@/core/interface/networking/packets/Packets';
import { asClass, asFunction, asValue, createContainer } from 'awilix';
import CommandManager from './app/command/CommandManager';
import CharacterAttackService from './app/service/CharacterAttackService';
import CharacterMoveService from './app/service/CharacterMoveService';
import CharacterUpdateTargetService from './app/service/CharacterUpdateTargetService';
import CreateCharacterService from './app/service/CreateCharacterService';
import DropItemService from './app/service/DropItemService';
import EnterGameService from './app/service/EnterGameService';
import LoadCharactersService from './app/service/LoadCharactersService';
import LogoutService from './app/service/LogoutService';
import MoveItemService from './app/service/MoveItemService';
import PickupItemService from './app/service/PickupItemService';
import SelectCharacterService from './app/service/SelectCharacterService';
import SelectEmpireService from './app/service/SelectEmpireService';
import UseItemService from './app/service/UseItemService';
import Commands from './domain/command/Commands';
import AuthenticateService from './domain/service/AuthenticateService';
import LeaveGameService from './domain/service/LeaveGameService';
import SaveCharacterService from './domain/service/SaveCharacterService';
import ItemRepository from './infra/database/ItemRepository';
import PlayerRepository from './infra/database/PlayerRepository';
import GameServer from './interface/server/GameServer';
import { makeGameConfig } from './infra/config/GameConfig';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import RedisCacheProvider from '@/core/infra/cache/RedisCacheProvider';
import { PrivilegeManager } from '@/core/domain/manager/PrivilegeManager';
import BattleServiceFactory from '@/core/domain/service/battle/BattleServiceFactory';

const container = createContainer();

container.register({
    containerInstance: asValue(container),
    server: asClass(GameServer).singleton(),
    logger: asClass(WinstonLoggerAdapter).singleton(),
    config: asFunction(makeGameConfig).singleton(),
    packets: asFunction(makePackets).singleton(),
    databaseManager: asClass(DatabaseManager).singleton(),
    world: asClass(World).singleton(),
    cacheProvider: asClass(RedisCacheProvider).singleton(),
    playerRepository: asClass(PlayerRepository).singleton(),
    itemRepository: asClass(ItemRepository).singleton(),
    authenticateService: asClass(AuthenticateService).scoped(),
    createCharacterService: asClass(CreateCharacterService).scoped(),
    loadCharactersService: asClass(LoadCharactersService).scoped(),
    selectEmpireService: asClass(SelectEmpireService).scoped(),
    selectCharacterService: asClass(SelectCharacterService).scoped(),
    playerFactory: asClass(PlayerFactory).scoped(),
    enterGameService: asClass(EnterGameService).scoped(),
    characterMoveService: asClass(CharacterMoveService).scoped(),
    animationManager: asClass(AnimationManager).singleton(),
    experienceManager: asClass(ExperienceManager).singleton(),
    saveCharacterService: asClass(SaveCharacterService).scoped(),
    leaveGameService: asClass(LeaveGameService).scoped(),
    commands: asFunction(Commands).singleton(),
    commandManager: asClass(CommandManager).singleton(),
    logoutService: asClass(LogoutService).scoped(),
    mobManager: asClass(MobManager).singleton(),
    itemManager: asClass(ItemManager).singleton(),
    moveItemService: asClass(MoveItemService).scoped(),
    useItemService: asClass(UseItemService).scoped(),
    pickupItemService: asClass(PickupItemService).scoped(),
    dropItemService: asClass(DropItemService).scoped(),
    itemCache: asClass(ItemCache).singleton(),
    spawnManager: asClass(SpawnManager).singleton(),
    characterAttackService: asClass(CharacterAttackService).scoped(),
    characterUpdateTargetService: asClass(CharacterUpdateTargetService).scoped(),
    dropManager: asClass(DropManager).singleton(),
    privilegeManager: asClass(PrivilegeManager).singleton(),
    battleServiceFactory: asClass(BattleServiceFactory).scoped(),
});

export { container };
