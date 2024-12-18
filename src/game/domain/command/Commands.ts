import Command from './Command';
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
import QuitCommand from './command/quit/QuitCommand';
import QuitCommandHandler from './command/quit/QuitCommandHandler';
import StatCommand from './command/stat/StatCommand';
import StatCommandHandler from './command/stat/StatCommandHandler';
import CommandHandler from './CommandHandler';

export type CommandConstructor<T extends Command> = {
    new (args?: any): T;
    getName(): string;
    getDescription(): string;
    example?: string;
};

export type CommandMapValue<T extends Command> = {
    command: CommandConstructor<T>;
    createHandler: (params: any) => CommandHandler<T>;
};

export default () =>
    new Map<string, CommandMapValue<any>>([
        [
            StatCommand.name,
            {
                command: StatCommand,
                createHandler: (params) => new StatCommandHandler(params),
            },
        ],
        [
            LogoutCommand.name,
            {
                command: LogoutCommand,
                createHandler: (params) => new LogoutCommandHandler(params),
            },
        ],
        [
            QuitCommand.name,
            {
                command: QuitCommand,
                createHandler: (params) => new QuitCommandHandler(params),
            },
        ],
        [
            ExperienceCommand.name,
            {
                command: ExperienceCommand,
                createHandler: (params) => new ExperienceCommandHandler(params),
            },
        ],
        [
            LevelCommand.name,
            {
                command: LevelCommand,
                createHandler: (params) => new LevelCommandHandler(params),
            },
        ],
        [
            GoldCommand.name,
            {
                command: GoldCommand,
                createHandler: (params) => new GoldCommandHandler(params),
            },
        ],
        [
            GotoCommand.name,
            {
                command: GotoCommand,
                createHandler: (params) => new GotoCommandHandler(params),
            },
        ],
        [
            ListCommand.name,
            {
                command: ListCommand,
                createHandler: (params) => new ListCommandHandler(params),
            },
        ],
        [
            InvokeCommand.name,
            {
                command: InvokeCommand,
                createHandler: (params) => new InvokeCommandHandler(params),
            },
        ],
        [
            ItemCommand.name,
            {
                command: ItemCommand,
                createHandler: (params) => new ItemCommandHandler(params),
            },
        ],
    ]);
