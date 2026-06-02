import Command from './Command';
import BlockModeCommand from './command/blockMode/BlockModeCommand';
import BlockModeCommandHandler from './command/blockMode/BlockModeCommandHandler';
import CloseShopCommand from './command/closeShop/CloseShopCommand';
import CloseShopCommandHandler from './command/closeShop/CloseShopCommandHandler';
import ExperienceCommand from './command/exp/ExperienceCommand';
import ExperienceCommandHandler from './command/exp/ExperienceCommandHandler';
import GoldCommand from './command/gold/GoldCommand';
import GoldCommandHandler from './command/gold/GoldCommandHandler';
import GotoCommand from './command/goto/GotoCommand';
import GotoCommandHandler from './command/goto/GotoCommandHandler';
import InvokeCommand from './command/invoke/InvokeCommand';
import InvokeCommandHandler from './command/invoke/InvokeCommandHandler';
import ItemCommand from './command/item/ItemCommand';
import ItemCommandHandler from './command/item/ItemCommandHandler';
import ListCommand from './command/list/ListCommand';
import ListCommandHandler from './command/list/ListCommandHandler';
import LogoutCommand from './command/logout/LogoutCommand';
import LogoutCommandHandler from './command/logout/LogoutCommandHandler';
import LevelCommand from './command/lvl/LevelCommand';
import LevelCommandHandler from './command/lvl/LevelCommandHandler';
import PolymorphCommand from './command/polymorph/PolymorphCommand';
import PolymorphCommandHandler from './command/polymorph/PolymorphCommandHandler';
import PrivilegeCommand from './command/privilege/PrivilegeCommand';
import PrivilegeCommandHandler from './command/privilege/PrivilegeCommandHandler';
import QuitCommand from './command/quit/QuitCommand';
import QuitCommandHandler from './command/quit/QuitCommandHandler';
import RestartHereCommand from './command/restartHere/RestartHereCommand';
import RestartHereCommandHandler from './command/restartHere/RestartHereCommandHandler';
import RestartTownCommand from './command/restartTown/RestartTownCommand';
import RestartTownCommandHandler from './command/restartTown/RestartTownCommandHandler';
import SelectCommand from './command/select/SelectCommand';
import SelectCommandHandler from './command/select/SelectCommandHandler';
import StatCommand from './command/stat/StatCommand';
import StatCommandHandler from './command/stat/StatCommandHandler';
import CommandHandler from './CommandHandler';

export type CommandConstructor<T extends Command> = {
    new (args?: any): T;
    getName(): string;
    getDescription(): string;
    getExample(): string;
};

export type CommandMapValue<T extends Command> = {
    command: CommandConstructor<T>;
    createHandler: (params: any) => CommandHandler<T>;
};

export default () =>
    new Map<string, CommandMapValue<any>>([
        [
            StatCommand.getName(),
            {
                command: StatCommand,
                createHandler: (params) => new StatCommandHandler(params),
            },
        ],
        [
            LogoutCommand.getName(),
            {
                command: LogoutCommand,
                createHandler: (params) => new LogoutCommandHandler(params),
            },
        ],
        [
            QuitCommand.getName(),
            {
                command: QuitCommand,
                createHandler: (params) => new QuitCommandHandler(params),
            },
        ],
        [
            ExperienceCommand.getName(),
            {
                command: ExperienceCommand,
                createHandler: (params) => new ExperienceCommandHandler(params),
            },
        ],
        [
            LevelCommand.getName(),
            {
                command: LevelCommand,
                createHandler: (params) => new LevelCommandHandler(params),
            },
        ],
        [
            GoldCommand.getName(),
            {
                command: GoldCommand,
                createHandler: (params) => new GoldCommandHandler(params),
            },
        ],
        [
            GotoCommand.getName(),
            {
                command: GotoCommand,
                createHandler: (params) => new GotoCommandHandler(params),
            },
        ],
        [
            ListCommand.getName(),
            {
                command: ListCommand,
                createHandler: (params) => new ListCommandHandler(params),
            },
        ],
        [
            InvokeCommand.getName(),
            {
                command: InvokeCommand,
                createHandler: (params) => new InvokeCommandHandler(params),
            },
        ],
        [
            ItemCommand.getName(),
            {
                command: ItemCommand,
                createHandler: (params) => new ItemCommandHandler(params),
            },
        ],
        [
            PrivilegeCommand.getName(),
            {
                command: PrivilegeCommand,
                createHandler: (params) => new PrivilegeCommandHandler(params),
            },
        ],
        [
            SelectCommand.getName(),
            {
                command: SelectCommand,
                createHandler: () => new SelectCommandHandler(),
            },
        ],
        [
            RestartHereCommand.getName(),
            {
                command: RestartHereCommand,
                createHandler: () => new RestartHereCommandHandler(),
            },
        ],
        [
            RestartTownCommand.getName(),
            {
                command: RestartTownCommand,
                createHandler: () => new RestartTownCommandHandler(),
            },
        ],
        [
            BlockModeCommand.getName(),
            {
                command: BlockModeCommand,
                createHandler: (params) => new BlockModeCommandHandler(params),
            },
        ],
        [
            CloseShopCommand.getName(),
            {
                command: CloseShopCommand,
                createHandler: (params) => new CloseShopCommandHandler(params),
            },
        ],
        [
            PolymorphCommand.getName(),
            {
                command: PolymorphCommand,
                createHandler: (params) => new PolymorphCommandHandler(params),
            },
        ],
    ]);
