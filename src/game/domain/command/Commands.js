import ExperienceCommand from './command/exp/ExperienceCommand.js';
import ExperienceCommandHandler from './command/exp/ExperienceCommandHandler.js';
import GoldCommand from './command/gold/GoldCommand.js';
import GoldCommandHandler from './command/gold/GoldCommandHandler.js';
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
    ]);
