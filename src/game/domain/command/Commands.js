import LogoutCommand from './command/logout/LogoutCommand.js';
import LogoutCommandHandler from './command/logout/LogoutCommandHandler.js';
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
    ]);
