---
name: add-quest
description: Creates a new quest in open-mt2 using the @Quest/@Task decorators and the AbstractQuest API. Use when the request is to add or change a game quest.
---

# Adding a quest

See also [docs/quests.md](../../../docs/quests.md), which already documents decorators, contexts and helpers well — this skill summarizes the essentials and the step that causes the most confusion (file location and auto-discovery).

## How it works

- `src/core/domain/quests/AbstractQuest.ts` — base class every concrete quest extends. Main helpers:
  - State: `addValue`/`getValue` (per-instance state), `setState`/`nextState` (transitions).
  - UI: `text`/`title`/`delay`/`letter`/`clearLetter`.
  - Interactive flow: `select`/`nextPage`/`unselect`/`unpause`/`cancel`.
  - Rewards: `giveItem`/`giveExp`/`giveGold`/`giveHorse`.
  - Inventory: `countItem`/`removeItem`.
  - Map target: `sendTarget`/`removeTarget` (via `QuestTargetManager`).
- `src/core/domain/quests/decorators/QuestDecorator.ts`:
  - `@Quest(name: string, initialState: string)` — decorates the class; `id` is auto-generated (`QuestUtil.getNextId()`).
  - `@Task({ state, when: QuestEventEnum, target?, with?, chat? })` — decorates a method as a task in the state machine. Events available in `QuestEventEnum`: `LOGIN`, `LOGOUT`, `CLICK`, `CHAT`, `KILL`, `LEVELUP`, `ENTER_STATE`, `LEAVE_STATE`, `LETTER`, `INFO`, `BUTTON`, among others.
- `src/core/domain/quests/facade/` (`PlayerQuest.ts`, `NpcQuest.ts`, `VictimQuest.ts`) — facades injected into the contexts (`{ player, npc, victim }`) depending on the event, exposing only what quest code needs from the real domain.
- `src/core/domain/quests/QuestManager.ts` — **loads quests automatically via filesystem scan**: reads every `.ts` file in `src/core/domain/quests/quests/`, filters exports that extend `AbstractQuest`, and registers each one using the decorators' metadata. **There is no manual central registry.**

## Real example (`HuntQuest`)

`src/core/domain/quests/quests/HuntQuest.ts`:
```ts
enum HuntQuestState { START = 'START', HUNT = 'HUNT', REWARD = 'REWARD' }

@Quest('HuntQuest', HuntQuestState.START)
export class HuntQuest extends AbstractQuest {
    @Task({ state: HuntQuestState.START, when: QuestEventEnum.LOGIN })
    public async startOnLogin({ player }: LoginExecutionContext) {
        return this.start(player);
    }

    @Task({ state: HuntQuestState.HUNT, when: QuestEventEnum.KILL })
    public async huntOnKill({ victim }: KillExecutionContext) {
        const questConfig = this.getCurrentConfig();
        if (victim.getMonsterId() === questConfig.target.id) {
            const killCount = this.increaseKillCount();
            if (killCount >= questConfig.target.count) return this.nextState(HuntQuestState.REWARD);
        }
    }

    @Task({ state: HuntQuestState.REWARD, when: QuestEventEnum.ENTER_STATE })
    public async rewardOnEnter({ player }: EnterExecutionContext) {
        return this.reward(player);
    }
}
```

Returning `this.nextState('X')` from inside a task triggers the state transition: it runs `LEAVE_STATE` on the current state and `ENTER_STATE`/`LETTER` on the new one (`AbstractQuest.endRunning`).

## Lifecycle (summary)

1. `QuestManager.addQuests(player)` instantiates every loaded quest class for the player at login and calls `instance.setState(meta.initialState)`.
2. Game events trigger `QuestManager` methods (`onLogin`, `onLevelUp`, `onClick`, `onKill`, `onAnswer`, `onButton`), called from various points in the domain (e.g. `Player.ts` on login, level up, killing a target).
3. `AbstractQuest.runState` filters the current state's tasks by `eventType` and runs the matching callback, with `with` as an optional conditional guard.

## Step by step

1. Create the file in `src/core/domain/quests/quests/<QuestName>.ts` — **location is mandatory**, it's the only folder scanned by `QuestManager.load()`.
2. Define the state `enum` and the class `export class MyQuest extends AbstractQuest`, decorated with `@Quest('MyQuest', InitialState)`.
3. Implement the methods decorated with `@Task({ state, when: QuestEventEnum.X, target?, with? })`, using the correct typed contexts (`LoginExecutionContext`, `KillExecutionContext`, `ClickExecutionContext`, etc., defined in `QuestDecorator.ts`).
4. Use `AbstractQuest` helpers for UI, flow, rewards, and state transitions.
5. **No central registration is needed** — the class is auto-discovered at boot, as long as it's a named export of the file and extends `AbstractQuest`.
6. Update `docs/quests.md` only if you introduce a new pattern/decorator/event that isn't documented there yet.
7. Tests: unit tests mocking `Player`/facades, and/or integration tests triggering real events (login, click, kill) through the socket harness (see the `testing-conventions` skill).
