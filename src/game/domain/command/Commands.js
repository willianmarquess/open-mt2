import ExperienceCommand from './command/exp/ExperienceCommand.js';
import ExperienceCommandHandler from './command/exp/ExperienceCommandHandler.js';
import GoldCommand from './command/gold/GoldCommand.js';
import GoldCommandHandler from './command/gold/GoldCommandHandler.js';
import GotoCommandHandler from './command/goto/GotoCommandHandler.js';
import GotoCommand from './command/goto/GotoCommand.js';
import InvokeCommand from './command/invoke/InvokeCommand.js';
import InvokeCommandHandler from './command/invoke/InvokeCommandHandler.js';
import ItemCommand from './command/item/ItemCommand.js';
import ItemCommandHandler from './command/item/ItemCommandHandler.js';
import ListCommand from './command/list/ListCommand.js';
import ListCommandHandler from './command/list/ListCommandHandler.js';
import LogoutCommand from './command/logout/LogoutCommand.js';
import LogoutCommandHandler from './command/logout/LogoutCommandHandler.js';
import LevelCommand from './command/lvl/LevelCommand.js';
import LevelCommandHandler from './command/lvl/LevelCommandHandler.js';
import QuitCommand from './command/quit/QuitCommand.js';
import QuitCommandHandler from './command/quit/QuitCommandHandler.js';
import StatCommand from './command/stat/StatCommand.js';
import StatCommandHandler from './command/stat/StatCommandHandler.js';

export default () =>
    new Map([
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
