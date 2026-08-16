---
name: testing-conventions
description: Unit and integration test conventions for open-mt2 (mocha, chai, sinon, socket harness). Use when writing or reviewing tests, or deciding whether a test should be unit or integration.
---

# Testing conventions

## Structure

- `test/unit/**` mirrors `src/**` 1:1. E.g.: `src/game/domain/command/command/goto/GotoCommandHandler.ts` → `test/unit/game/domain/command/goto/GotoCommandHandler.test.ts`.
- `test/integration/{auth,game}/**` — specs organized around a bug/feature, with descriptive names (e.g. `gotoTeleport.test.ts`, `chatFloodSecurity.test.ts`, `duplicateSessionSecurity.test.ts`), they do **not** mirror the `src` tree.
- `test/support/SocketClient.ts` — raw TCP client (`node:net`), speaks the binary protocol directly (`sendMessage`/`nextMessage(length)`), no packet parsing — used for low-level specs.
- `test/support/AttackSession.ts` (`AttackHarness`) — high-level harness that spins up a real `GameApplication` inside the test process, shared as a static singleton (`AttackHarness.shared`) across specs to avoid reopening the DB/Redis pool. Exposes `login({ username, x, y })`, `findPlayer`, `capturedRejections()` (to prove DoS resilience without crashing the test runner), and cleans up seeded accounts in `stop()`.
- `test/setup.integration.ts` — global mocha root hooks: starts `AuthApplication` in `before`, calls `AttackHarness.shutdown()` + `app.close()` in `after`.

## Config and scripts

- `test/.mocharc.unit.json` — `spec: "test/unit/**/*.test.ts"`, `require: ["ts-node/register"]`, no setup file.
- `test/.mocharc.integration.json` — `spec: "test/integration/**/*.test.ts"`, `file: "test/setup.integration.ts"`, `timeout: 10000`.
- `npm run test:unit` — runs unit tests (fast, no external infrastructure).
- `npm run test:integration` — requires MySQL + Redis running (`npm run docker:dep`) and the game port free; loads `.env`.
- `npm run test:coverage` — coverage via `c8` on top of `test:unit`.
- There is no generic `npm test` script configured.

## Unit test pattern

Mocha (`describe`/`it`) + Chai (`expect`) + Sinon (`sinon.createStubInstance`, `sinon.stub`, `sinon.assert.callOrder`). Dependencies are stubbed and injected manually into the constructor — **the real container is not used**.

```ts
import { expect } from 'chai';
import sinon from 'sinon';

beforeEach(() => {
    logger = sinon.createStubInstance(WinstonLoggerAdapter);
    world = sinon.createStubInstance(World);
    handler = new GotoCommandHandler({ logger, world });
    ...
});
afterEach(() => sinon.restore());

it('should despawn from the origin before the position changes (issue #88)', async () => {
    ...
    expect(world.despawn.calledOnceWith(player)).to.be.true;
    sinon.assert.callOrder(world.despawn, player.teleport);
});
```

## Integration test pattern

Spins up a real in-process server using the real container (`@/game/Container`) and `GameApplication`/`AuthApplication`. Requires MySQL + Redis already running via Docker (standard comment on these specs: *"Needs MySQL + Redis up (docker) and the game port free"*).

```ts
before(async () => { harness = await new AttackHarness().start(); });
after(async () => { await session?.close(); await harness?.stop(); });

it('answers /goto location with a TeleportPacket ...', async () => {
    session = await harness.login({ username: TRAVELLER, x: ORIGIN_X, y: ORIGIN_Y });
    session.command(`/goto location ${TARGET_X} ${TARGET_Y}`);
    await session.settle(800);
    expect(session.received().includes(warp), '...').to.equal(true);
});
```

Assertions typically compare exact received bytes (buffers built manually with `PacketHeaderEnum` + `writeUInt32LE`) or domain state (`player.getPositionX()`).

## When to use each

- **Unit**: logic in a single handler/service/validator, mockable dependencies, no need for a real socket. This is the default — faster and easier to maintain.
- **Integration**: when the behavior only exists in the real composition (packet routing, sequencing of events across multiple components, exact bytes on the wire) or when the original bug only reproduces at this level (many integration specs reference an `issue #NNN`).

## Step by step when adding a test

1. Unit: create the file mirroring the `src` path under `test/unit`, name it `<Class>.test.ts`, stub every injected dependency with `sinon.createStubInstance`, use `chai.expect`, always add `afterEach(() => sinon.restore())`.
2. Integration: create it under `test/integration/{auth|game}/<bug-or-feature-description>.test.ts`, use `AttackHarness`/`SocketClient` from `test/support/`. Run `npm run docker:dep` first if MySQL/Redis aren't up yet.
3. Run `npm run test:unit` (and `npm run test:integration` if applicable) before considering the task done.
