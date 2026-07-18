import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';

type PlayerRow = RowDataPacket & PlayerState;

export default class PlayerRepository implements IPlayerRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }: { databaseManager: DatabaseManager }) {
        this.databaseManager = databaseManager;
    }

    async create(player: PlayerState) {
        const [result] = await this.databaseManager.getConnection().execute<ResultSetHeader>(
            `
        insert into game.player (
            accountId, 
            createdAt, 
            updatedAt, 
            empire, 
            playerClass, 
            skillGroup, 
            playTime, 
            level, 
            experience, 
            gold, 
            st, 
            ht, 
            dx, 
            iq, 
            positionX, 
            positionY, 
            health, 
            mana, 
            stamina, 
            bodyPart, 
            hairPart, 
            name, 
            givenStatusPoints, 
            availableStatusPoints,
            slot,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName
        )
            values
        (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        );
        `,
            [
                player.accountId,
                player.createdAt,
                player.updatedAt,
                player.empire,
                player.playerClass,
                player.skillGroup,
                player.playTime,
                player.level,
                player.experience,
                player.gold,
                player.st,
                player.ht,
                player.dx,
                player.iq,
                player.positionX,
                player.positionY,
                player.health,
                player.mana,
                player.stamina,
                player.bodyPart,
                player.hairPart,
                player.name,
                player.givenStatusPoints,
                player.availableStatusPoints,
                player.slot,
                player.horseLevel,
                player.horseHealth,
                player.horseStamina,
                player.horseName,
            ],
        );

        return result.insertId;
    }

    async nameAlreadyExists(name: string): Promise<boolean> {
        const [players] = await this.databaseManager.getConnection().query<PlayerRow[]>(
            `
        SELECT * FROM game.player WHERE name = ?;
        `,
            [name],
        );

        return players.length > 0;
    }

    async update(player: PlayerState) {
        await this.databaseManager.getConnection().query<ResultSetHeader>(
            `
        UPDATE game.player SET 
            accountId = ?, 
            createdAt = ?, 
            updatedAt = ?, 
            empire = ?, 
            playerClass = ?, 
            skillGroup = ?, 
            playTime = ?, 
            level = ?, 
            experience = ?, 
            gold = ?, 
            st = ?, 
            ht = ?, 
            dx = ?, 
            iq = ?, 
            positionX = ?, 
            positionY = ?, 
            health = ?, 
            mana = ?, 
            stamina = ?, 
            bodyPart = ?, 
            hairPart = ?, 
            name = ?, 
            givenStatusPoints = ?, 
            availableStatusPoints = ?,
            slot = ?,
            horseLevel = ?,
            horseHealth = ?,
            horseStamina = ?,
            horseName = ?
        WHERE id = ?;
        `,
            [
                player.accountId,
                player.createdAt,
                player.updatedAt,
                player.empire,
                player.playerClass,
                player.skillGroup,
                player.playTime,
                player.level,
                player.experience,
                player.gold,
                player.st,
                player.ht,
                player.dx,
                player.iq,
                player.positionX,
                player.positionY,
                player.health,
                player.mana,
                player.stamina,
                player.bodyPart,
                player.hairPart,
                player.name,
                player.givenStatusPoints,
                player.availableStatusPoints,
                player.slot,
                player.horseLevel,
                player.horseHealth,
                player.horseStamina,
                player.horseName,
                player.id,
            ],
        );
    }

    async getById(id: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager.getConnection().query<PlayerRow[]>(
            `
        SELECT * FROM game.player WHERE id = ?;
        `,
            [id],
        );

        return this.mapToEntity(players[0]);
    }

    async getByAccountId(accountId: number): Promise<PlayerState[]> {
        const [players] = await this.databaseManager.getConnection().query<PlayerRow[]>(
            `
        SELECT * FROM game.player WHERE accountId = ?;
        `,
            [accountId],
        );

        return players.map((p) => this.mapToEntity(p)) as PlayerState[];
    }

    async getByAccountIdAndSlot(accountId: number, slot: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager.getConnection().query<PlayerRow[]>(
            `
        SELECT * FROM game.player WHERE accountId = ? and slot = ?;
        `,
            [accountId, slot],
        );

        return this.mapToEntity(players[0]);
    }

    private mapToEntity(player?: PlayerRow): PlayerState | null {
        if (!player) return null;

        const {
            id,
            accountId,
            createdAt,
            updatedAt,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName,
        } = player;

        return new PlayerState({
            id,
            accountId,
            createdAt,
            updatedAt,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName,
        });
    }
}
