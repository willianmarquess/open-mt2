## Writing Quests (Server)

This document explains how quests are implemented on the server and how to create new quests. The examples and API below are based on `AbstractQuest`, the quest decorator usage (e.g. `@Quest`, `@Task`) and sample quests such as `WelcomeQuest` and `HuntQuest`.

### Overview

- A quest is a class that extends `AbstractQuest` and is decorated with `@Quest(name, initialState)`.
- Each quest defines one or more named states and task handlers that respond to quest events (login, kill, button, info, enter/leave state, etc.).
- Tasks are registered via `@Task({ state, when, with? })` and receive an execution context containing the player and event-specific data.

### Examples

- Example quests: [src/core/domain/quests/quests/WelcomeQuest.ts](src/core/domain/quests/quests/WelcomeQuest.ts) and [src/core/domain/quests/quests/HuntQuest.ts](src/core/domain/quests/quests/HuntQuest.ts). For `CLICK`-driven NPC interaction see [ShopQuest.ts](src/core/domain/quests/quests/ShopQuest.ts), and for a state-machine-heavy example see [SkillQuest.ts](src/core/domain/quests/quests/SkillQuest.ts).

### Decorators and signatures (usage)

- `@Quest(questName: string, initialStateName: string)` — marks a class as a quest and sets the initial state name.
- `@Task({ state: string, when: QuestEventEnum, target?: number | number[], with?: (ctx) => boolean | Promise<boolean> })` — marks a method to run when the given event happens while the quest is in the specified state. Optional `with` is a condition that can short-circuit execution.
- `target` applies to `CLICK` and `KILL` tasks: the mob/NPC vnum (or a list of vnums) the event must match. Example from `ShopQuest`:

```ts
@Task({ state: ShopQuestState.START, when: QuestEventEnum.CLICK, target: [ShopIdEnum.GOODS, ShopIdEnum.POTIONS] })
```

Typical method signature for task handlers:

```ts
// examples from the codebase
public async startOnLogin({ player }: LoginExecutionContext) { ... }
public async huntOnKill({ victim }: KillExecutionContext) { ... }
```

### Events and execution contexts

Available events (`QuestEventEnum`): `LOGIN`, `LOGOUT`, `CLICK`, `KILL`, `LEVELUP`, `ENTER_STATE`, `LEAVE_STATE`, `LETTER`, `INFO`, `BUTTON`.

Each event has a matching context type passed to the task callback:

- `LoginExecutionContext` / `LogoutExecutionContext` — trigger is player login/logout (gives access to `player`).
- `ClickExecutionContext` — the player clicked an NPC matching `target`; contains `npc` (an `NpcQuest` facade with `getId()`, `getVirtualId()`, `getLevel()`, `openShop()`).
- `KillExecutionContext` — contains `victim` (the killed monster).
- `LevelUpExecutionContext` — the player leveled up.
- `EnterExecutionContext` / `LeaveExecutionContext` — used when entering/leaving a state.
- `LetterExecutionContext`, `InfoExecutionContext`, `ButtonExecutionContext` — quest-letter UI interactions (see `HuntQuest` for usage).

### Quest lifecycle

1. The quest starts in the decorator-provided initial state.
2. Events are routed to tasks registered for the current state and event type.
3. A task may return a `TaskResult` object with `nextState` to transition.
4. When a transition happens, `AbstractQuest` runs leave/enter handlers and resets state-specific transient values.

### Common AbstractQuest helpers (available methods)

Below are the most commonly used helpers available to implement quest behavior (names and behavior taken from `AbstractQuest`):

- `addValue<T>(name: string, value: T)` — store a per-quest key/value for the current quest instance.
- `getValue<T>(name: string): T` — retrieve a stored value.

UI / flow helpers:

- `text(text: string)` — append a quest text line to the current output.
- `title(text: string)` — append a titled line (colors applied internally).
- `delay(value: number)` — append a `[DELAY]` entry to the script.
- `button(name: string)` — returns a button control string you can include in custom `send()` calls.
- `letter(title: string)` — send a quest letter UI (no window skin) with the specified title.
- `clearLetter()` — clear the letter; resets internal start state and sets the appropriate quest flag.

Interaction helpers:

- `nextPage()` — mark the script to advance to a next page; the quest will pause until resumed.
- `select(options: string[], done?: boolean)` — send a select question and wait for player selection. Returns chosen index.
- `unselect(answer: number)` — called by the server when the player answered; resolves `select()` promise.
- `unpause()` — resume after `nextPage()`.

Reward & persistence helpers:

- `giveItem(id: number, quantity?: number)` — give an item to the player (uses `ItemManager`).
- `giveExp(value: number)` — give experience via `PlayerQuest` facade.
- `giveGold(value: number)` — give gold via `PlayerQuest` facade.

State UI flags and info packet

- `AbstractQuest` uses an internal `BitFlag` (`questFlags`) and a `QuestFlagEnum` to track which pieces of state/UI were changed (title, counter, clock, icon file, etc.).
- When information about the quest needs to be sent to the client, `sendInfoPacket()` builds a packet using `questFlags.getFlag()` and then calls `questFlags.reset()`.
- Use the helper methods below to mark UI fields and automatically set flags:
  - `setTitle(title: string)`
  - `setStart()`
  - `setClockName(name: string)`
  - `setClockValue(value: number)`
  - `setCounterName(name: string)`
  - `setCounterValue(value: number)`
  - `setIconFile(src: string)`

### Example quest

```ts
enum MyQuestState {
  START = 'START',
  DO = 'DO',
  REWARD = 'REWARD'
}

@Quest('MyQuest', MyQuestState.START)
export class MyQuest extends AbstractQuest {
  @Task({ state: MyQuestState.START, when: QuestEventEnum.LOGIN })
  public async onLogin({ player }: LoginExecutionContext) {
    this.title('My Quest');
    this.text('Welcome. Do something.');
    return this.nextState(MyQuestState.DO);
  }

  @Task({ state: MyQuestState.DO, when: QuestEventEnum.KILL })
  public async onKill({ victim }: KillExecutionContext) {
    const count = Number(this.getValue('kills') || 0) + 1;
    this.addValue('kills', count);
    if (count >= 5) return this.nextState(MyQuestState.REWARD);
  }

  @Task({ state: MyQuestState.REWARD, when: QuestEventEnum.ENTER_STATE })
  public async onReward({ player }: EnterExecutionContext) {
    this.giveGold(1000);
    this.giveExp(50);
    return this.nextState(MyQuestState.START);
  }
}
```
