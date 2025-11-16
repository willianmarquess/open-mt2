import { authFlow } from './authFlow';
import GameFlow from './gameFlow';
import atlasInfo from '@/core/infra/config/data/atlasinfo.json';
import timers from 'node:timers/promises';
import { container } from '@/game/Container';
import MathUtil from '@/core/domain/util/MathUtil';

const SIGNALS = ['SIGINT', 'SIGTERM'];
const ERRORS = ['unhandledRejection', 'uncaughtException'];
const MAX_FAKE_PLAYERS = 80;

const users: Array<string> = [];
const gameFlows: Array<GameFlow> = [];
const db = container.resolve('databaseManager');

const shutdown = async (signal: string) => {
    console.log(`Signal received: ${signal}`);
    try {
        await closeConnections();
        await clearData(db);
        console.log('Game/Auth server terminated.');
    } catch (err) {
        console.error('Error during shutdown:', err);
    } finally {
        process.exit(0);
    }
};

SIGNALS.forEach((signal) => process.on(signal, () => shutdown(signal)));
ERRORS.forEach((error) =>
    process.on(error, (err) => {
        console.error(`Error received: ${error}`, err);
        shutdown(error);
    }),
);

async function closeConnections() {
    return Promise.all(gameFlows.map((gameFlow) => gameFlow.close()));
}

async function createData(db, i, positionX, positionY) {
    const user = `user${i}`;
    const password = 'admin';
    const hashedPassword = '$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS';

    try {
        await db.getConnection().query('DELETE FROM auth.account WHERE username = ?', [user]);
        const [result] = await db
            .getConnection()
            .query(
                `INSERT INTO auth.account (deleteCode, email, password, accountStatusId, username) VALUES (?, ?, ?, ?, ?)`,
                ['1234567', 'admin@test.com', hashedPassword, 1, user],
            );

        const accountId = result.insertId;
        await db.getConnection().query('DELETE FROM game.player WHERE name = ?', [user]);
        await db.getConnection().query(
            `INSERT INTO game.player (
                accountId, empire, playerClass, skillGroup, playTime, level, experience,
                gold, st, ht, dx, iq, positionX, positionY, health, mana, stamina, bodyPart,
                hairPart, name, givenStatusPoints, availableStatusPoints, slot
            ) VALUES (?, 2, 4, 0, 9105, 99, 0, 12038002, 17, 107, 12, 6, ?, ?, 15950, 5570, 1000, 0, 0, ?, 396, 192, 0)`,
            [accountId, positionX, positionY, user],
        );

        return { user, password };
    } catch (error) {
        console.error('Error creating data for user:', user, error);
        throw error;
    }
}

async function clearData(db) {
    for (const user of users) {
        console.log('Removing user:', user);
        try {
            await db.getConnection().query('DELETE FROM auth.account WHERE username = ?', [user]);
            await db.getConnection().query('DELETE FROM game.player WHERE name = ?', [user]);
        } catch (error) {
            console.error('Error removing user:', user, error);
        }
    }
}

import path from 'path';
import fsSync from 'fs';
import fs from 'fs/promises';

const DEFAULT_SPAWN_CONFIG_PATH = 'src/core/infra/config/data/spawn';

const BATCH_SIZE = 50; // Number of players to move simultaneously per batch
const DELAY_BETWEEN_BATCHES = 50; // Milliseconds between batches

const allowedAreas = [
    'map_a2',
    'map_n_snowm_01',
    'metin2_map_a1',
    'metin2_map_a3',
    'metin2_map_b1',
    'metin2_map_b3',
    'metin2_map_c1',
    'metin2_map_c3',
    'metin2_map_deviltower1',
    'metin2_map_n_desert_01',
    'metin2_map_n_flame_01',
    'metin2_map_spiderdungeon',
    'metin2_map_spiderdungeon_02',
];

async function createFakePlayersSpread() {
    const currentDir = process.cwd();
    let i = 0;
    for (const { mapName, posX, posY, aka } of atlasInfo) {
        if (!allowedAreas.includes(mapName)) continue;

        const absoluteFilePath = path.join(currentDir, DEFAULT_SPAWN_CONFIG_PATH + `/${mapName}/regen.json`);
        if (fsSync.existsSync(absoluteFilePath)) {
            const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
            const spawnsData = JSON.parse(fileContent || '');

            console.log(`Creating fake playes at ${mapName}, aka: ${aka}`);

            let counter = 0;
            for (const { x, y } of spawnsData) {
                if (counter >= MAX_FAKE_PLAYERS) break;

                const posXI = MathUtil.getRandomInt(-5_000, 5_000);
                const posYI = MathUtil.getRandomInt(-5_000, 5_000);
                const positionX = posX + x * 100 + posXI;
                const positionY = posY + y * 100 + posYI;
                const { user, password } = await createData(db, i, positionX, positionY);
                users.push(user);

                const token = await authFlow(user, password);
                const gameFlow = new GameFlow(user, token);

                await gameFlow.connect();
                await gameFlow.basicFlow();
                gameFlows.push(gameFlow);

                i++;
                counter++;
            }

            console.log(`Initialized ${counter} fake players at ${mapName}, aka: ${aka}.`);
        }

        console.log(`Total of players fake created ${users.length}`);
    }
}

async function startRandomMovement() {
    const totalBatches = Math.ceil(gameFlows.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, gameFlows.length);
        const batchFlows = gameFlows.slice(start, end);
        const movePromises = batchFlows.map((gameFlow) => gameFlow.moveToRandomLocation());

        await Promise.all(movePromises);

        if (batchIndex < totalBatches - 1) {
            await timers.setTimeout(DELAY_BETWEEN_BATCHES);
        }
    }

    await timers.setTimeout(MathUtil.getRandomInt(250, 500));

    startRandomMovement();
}

async function main() {
    try {
        await createFakePlayersSpread();
        await startRandomMovement();
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
