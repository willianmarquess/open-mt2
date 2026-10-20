import { expect } from 'chai';
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import PlayerRepository from '@/game/infra/database/PlayerRepository';
import { PlayerState } from '@/core/domain/entities/state/player/PlayerState';

const makePlayerState = (overrides: Record<string, unknown> = {}) =>
    new PlayerState({
        id: 1,
        accountId: 1,
        empire: 1,
        playerClass: 0,
        skillGroup: 0,
        playTime: 0,
        level: 1,
        experience: 0,
        gold: 0,
        st: 0,
        ht: 0,
        dx: 0,
        iq: 0,
        positionX: 0,
        positionY: 0,
        health: 100,
        mana: 100,
        stamina: 100,
        bodyPart: 0,
        hairPart: 0,
        name: 'test',
        givenStatusPoints: 0,
        availableStatusPoints: 0,
        availableSkillPoints: 0,
        slot: 0,
        skills: [],
        ...overrides,
    } as any);

// Opt-in: run only against a disposable local MySQL instance with an empty root password.
const databaseTests = process.env.SUB_SKILL_TEST_MYSQL_PORT ? describe : describe.skip;
databaseTests('Sub-skill persistence on fresh and upgraded MySQL schemas', () => {
    for (const upgraded of [false, true]) {
        it(
            upgraded
                ? 'upgrades an existing table without awarding retrospective points'
                : 'persists balances on a fresh table',
            async () => {
                const connection = await mysql.createConnection({
                    host: '127.0.0.1',
                    port: Number(process.env.SUB_SKILL_TEST_MYSQL_PORT),
                    user: 'root',
                    password: '',
                });
                const database = `sub_skill_test_${randomUUID().replace(/-/g, '')}`;
                try {
                    await connection.query(`CREATE DATABASE ${database}`);
                    let schema = readFileSync('src/core/infra/database/scripts/script.sql', 'utf8')
                        .match(/CREATE TABLE game\.player \([\s\S]*?\n\);/)![0]
                        .replace('game.player', `${database}.player`);
                    if (upgraded) schema = schema.replace(/ {4}subSkill INT UNSIGNED NOT NULL DEFAULT 0,\r?\n/, '');
                    await connection.query(schema);
                    if (upgraded) {
                        await connection.query(`INSERT INTO ${database}.player
                        (accountId, empire, playerClass, skillGroup, positionX, positionY, health, mana, stamina, name, level, skills, quickSlot)
                        VALUES (1,1,0,1,0,0,100,100,100,'Existing',50,'[]','[]')`);
                        const alter = readFileSync('docs/sub-skill-points-upgrade.md', 'utf8')
                            .match(/ALTER TABLE game\.player[\s\S]*?;/)![0]
                            .replace('game.player', `${database}.player`);
                        await connection.query(alter);
                        const [rows]: any = await connection.query(`SELECT subSkill, level FROM ${database}.player`);
                        expect(rows[0]).to.include({ subSkill: 0, level: 50 });
                    }
                    const repository = new PlayerRepository({
                        databaseManager: {
                            getConnection: () => ({
                                execute: (sql: string, params: any[]) =>
                                    connection.execute(sql.replace(/game\.player/g, `${database}.player`), params),
                                query: (sql: string, params: any[]) =>
                                    connection.query(sql.replace(/game\.player/g, `${database}.player`), params),
                            }),
                        } as any,
                    });
                    const id = await repository.create(makePlayerState({ level: 50, subSkill: 7 }));
                    let loaded = await repository.getById(id);
                    expect((loaded as any).subSkill).to.equal(7);
                    await repository.update(makePlayerState({ id, level: 50, subSkill: 0 }));
                    loaded = await repository.getById(id);
                    expect((loaded as any).subSkill).to.equal(0);
                    expect(loaded!.level).to.equal(50);
                } finally {
                    await connection.end();
                }
            },
        );
    }
});
