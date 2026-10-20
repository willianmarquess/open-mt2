# Sub-skill point persistence upgrade

Before starting a server version that persists sub-skill points, back up the existing database and apply this statement once if `game.player` does not already have the column:

```sql
ALTER TABLE game.player
    ADD COLUMN subSkill INT UNSIGNED NOT NULL DEFAULT 0 AFTER availableSkillPoints;
```

The table is `game.player`, as used by PlayerRepository and the initial schema.
Existing characters start with zero stored sub-skill points. This does not grant retrospective points or reconstruct spent balances from character levels.

New databases already receive the column from `script.sql`. Do not rerun that initialization script against an existing database: it drops databases and tables.

Apply the schema change before deploying the server code; otherwise player inserts and updates referencing the missing column will fail. Keep the column if rolling back the application so saved balances are retained.

## Regression validation

The opt-in test `test/integration/database/subSkillPersistence.test.ts` checks the initial table schema and the documented upgrade against MySQL, then exercises PlayerRepository inserts, updates and reads. It also verifies that an existing level-50 character receives zero retrospective points.

Use a disposable local MySQL instance with an empty root password. Set `SUB_SKILL_TEST_MYSQL_PORT` to its published localhost port and run:

```sh
npx mocha --no-config --require ts-node/register/transpile-only --require tsconfig-paths/register test/integration/database/subSkillPersistence.test.ts --exit
```

The test creates uniquely named diagnostic databases. It does not initialize or modify `game` or `auth`; queries are redirected to the diagnostic player table. Destroy the disposable instance after testing.
