---
name: add-command
description: Creates a new chat command (/something) in the open-mt2 game server — Command, Validator, Handler, registration in Commands.ts, and README update. Use when the request is to add a GM or player command.
---

# Adding a command (`/something`)

Commands are triggered via chat: `ChatInPacketHandler` (`src/core/interface/networking/packets/packet/in/chat/ChatInPacketHandler.ts`) detects messages starting with `/` and delegates to `CommandManager` (`src/game/app/command/CommandManager.ts`), which resolves the command from the `Map` built in `Commands.ts` and executes it.

Today **any player can execute any command** (no privilege check) — if the new command should be restricted to GMs, that needs to be implemented in the handler.

## Base

- `src/game/domain/command/Command.ts` — abstract class. Constructor receives `{ args, validator }` and **already calls the validator's `build()` immediately** (unlike packets, here you don't need to call `validate()` manually). Required static methods:
  - `getName()` — command name with the leading slash, e.g. `'/clearskill'`.
  - `getDescription()` — used by the automatic `/help`.
  - `getExample()` — optional, defaults to `''`.
- `src/game/domain/command/CommandHandler.ts`:
  ```ts
  export default abstract class CommandHandler<T extends Command> {
      abstract execute(player: Player, command: T): Promise<void>;
  }
  ```
- `src/game/domain/command/CommandValidator.ts` — extends `FluentValidator`, same pattern as `PacketValidator`.
- `src/game/domain/command/Commands.ts` — `createCommands()` returns the `Map<string, CommandMapValue<T>>` registered in the container (`commands: asFunction(Commands).singleton()`). `/help` automatically lists every command registered here (name + description + example) — no manual maintenance needed.

## Real example (`/clearskill`)

`src/game/domain/command/command/clearSkill/ClearSkillCommand.ts`:
```ts
export default class ClearSkillCommand extends Command {
    constructor({ args }: { args: Array<string> }) {
        super({ args, validator: ClearSkillCommandValidator });
    }
    static getName() { return '/clearskill'; }
    static getDescription() { return 'clear all of your skills from you or another player'; }
    static getExample() { return '/clearskill [playerName]'; }
}
```

`ClearSkillCommandValidator.ts`:
```ts
export default class ClearSkillCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs(), 'args').isRequired().isArray().build();
        this.createRule(this.command.getArgs()[0], 'playerName').isOptional().isString().build();
    }
}
```

`ClearSkillCommandHandler.ts` injects `{ logger, entityManager }` from the cradle, validates (`command.isValid()`, otherwise `player.sendCommandErrors(errors)`), resolves the `targetPlayer` (the player itself or via `entityManager.getPlayerByName(name)`), and calls `targetPlayer.clearSkill()`.

Registration in `Commands.ts`:
```ts
[ ClearSkillCommand.getName(), { command: ClearSkillCommand, createHandler: (params) => new ClearSkillCommandHandler(params) } ],
```

`createHandler` receives the full container (cradle) when `CommandManager.execute` calls `createHandler(this.container)`.

## Step by step

1. Create the folder `src/game/domain/command/command/<commandName>/`.
2. Create `<Name>Command.ts` — extends `Command`; `getName()` always with a leading `/`; `getDescription()`; `getExample()`.
3. Create `<Name>CommandValidator.ts` — extends `CommandValidator`; implement `build()` with `this.createRule(...).build()` per argument.
4. Create `<Name>CommandHandler.ts` — extends `CommandHandler<T>`; inject dependencies from the cradle; validate; call the domain/service layer.
5. Register it in `src/game/domain/command/Commands.ts` (import + entry in the Map inside `createCommands()`).
6. If the handler uses new dependencies, register them in `src/game/Container.ts`.
7. **Update `README.md`, `## Commands` section** — add a bullet with the name, description and example, matching the format of the existing entries. This list is maintained manually; recent commands have already been left out of it, so don't skip this step.
8. Tests: a unit test for the handler (mock `Player`/dependencies with sinon) and, when it makes sense, an integration test triggering the command via chat through `SocketClient`/`AttackSession` (see the `testing-conventions` skill).
