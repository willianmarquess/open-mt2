import LogoutCommand from './command/logout/LogoutCommand.js';
import LogoutCommandHandler from './command/logout/LogoutCommandHandler.js';
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
    ]);
