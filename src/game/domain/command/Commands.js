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
    ]);
