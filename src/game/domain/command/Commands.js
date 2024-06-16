import StatCommand from './command/stat/StatCommand.js';
import StatCommandHandler from './handlers/StatCommandHandler.js';

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
