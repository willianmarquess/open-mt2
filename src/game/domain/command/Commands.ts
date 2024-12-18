import Command from "./Command";

export type CommandMapValue<T extends Command> = {
    command: () => new (args?: any) => T;
    createHandler: (params: any) => Command;
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
