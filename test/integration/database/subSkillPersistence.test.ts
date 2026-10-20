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
                    const verifyRow = async (id: number, state: PlayerState) => {
                        const [rows]: any = await connection.query(`SELECT * FROM ${database}.player WHERE id = ?`, [
                            id,
                        ]);
                        const expected = {
                            ...state,
                            id,
                            deletedAt: null,
                            skills: state.skills,
                            quickSlot: Array.from(state.quickSlot, ([slot, entry]) => ({ slot, ...entry })),
                        };
                        expect(rows[0]).to.deep.equal(expected);
                    };
                    const initial = makePlayerState({
                        accountId: 4,
                        empire: 2,
                        playerClass: 1,
                        skillGroup: 1,
                        playTime: 123,
                        level: 50,
                        experience: 456,
                        gold: 789,
                        st: 11,
                        ht: 12,
                        dx: 13,
                        iq: 14,
                        positionX: -150,
                        positionY: 250,
                        health: 345,
                        mana: 234,
                        stamina: 123,
                        bodyPart: 4,
                        hairPart: 5,
                        name: 'Persistence',
                        givenStatusPoints: 100,
                        availableStatusPoints: 20,
                        availableSkillPoints: 10,
                        subSkill: 7,
                        slot: 1,
                        horseLevel: 12,
                        horseHealth: 300,
                        horseStamina: 200,
                        horseName: 'Horse',
                        horseRiding: 1,
                        createdAt: new Date('2026-01-02T03:04:05Z'),
                        updatedAt: new Date('2026-02-03T04:05:06Z'),
                        skills: [{ rank: 0, level: 2, timeToNextRead: 3, readCount: 4 }],
                        quickSlot: new Map([[3, { type: 1, position: 5 }]]),
                    });
                    const id = await repository.create(initial);
                    await verifyRow(id, initial);
                    let loaded = await repository.getById(id);
                    expect(loaded).to.deep.equal(new PlayerState({ ...initial, id }));
                    const updated = makePlayerState({
                        id,
                        level: 50,
                        subSkill: 0,
                        createdAt: initial.createdAt,
                        updatedAt: new Date('2026-03-04T05:06:07Z'),
                        horseName: '',
                        skills: [],
                        quickSlot: new Map(),
                    });
                    await repository.update(updated);
                    await verifyRow(id, updated);
                    loaded = await repository.getById(id);
                    expect(loaded).to.deep.equal(updated);
                } finally {
                    await connection.end();
                }
            },
        );
    }
});
