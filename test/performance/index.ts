import { authFlow } from './authFlow';
import GameFlow from './gameFlow';
import regen from '@/core/infra/config/data/spawn/metin2_map_c1/regen.json';
import timers from 'node:timers/promises';
import { container } from '@/game/Container';
import MathUtil from '@/core/domain/util/MathUtil';

const SIGNALS = ['SIGINT', 'SIGTERM'];
const ERRORS = ['unhandledRejection', 'uncaughtException'];
const MAX_FAKE_PLAYERS = 500;

const users = [];
const gameFlows = [];
const db = container.resolve('databaseManager');

const shutdown = async (signal) => {
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

async function createFakePlayers() {
    let i = 0;

    for (const { x, y } of regen as any) {
        if (i >= MAX_FAKE_PLAYERS) break;

        const positionX = 921600 + x * 100;
        const positionY = 204800 + y * 100;
        const { user, password } = await createData(db, i, positionX, positionY);
        users.push(user);

        const token = await authFlow(user, password);
        const gameFlow = new GameFlow(user, token);

        await gameFlow.connect();
        await gameFlow.basicFlow();
        gameFlows.push(gameFlow);

        i++;
    }

    console.log(`Initialized ${i} fake players.`);
    return gameFlows;
}

async function startRandomMovement(gameFlows) {
    for (const gameFlow of gameFlows) {
        setTimeout(() => gameFlow.moveToRandomLocation(), MathUtil.getRandomInt(1000, 3000));
    }

    await timers.setTimeout(3000);
    startRandomMovement(gameFlows);
}

async function main() {
    try {
        const gameFlows = await createFakePlayers();
        await startRandomMovement(gameFlows);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
