import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader } from 'mysql2';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';

export default class PlayerRepository implements IPlayerRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }) {
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
            slot
        )
            values
        (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
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
            ],
        );

        return result.insertId;
    }

    async nameAlreadyExists(name: string) {
        const [players] = await this.databaseManager.getConnection().query(
            `
        SELECT * FROM game.player WHERE name = ?;
        `,
            [name],
        );

        return !!players[0];
    }

    async update(player: PlayerState) {
        await this.databaseManager.getConnection().query(
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
            slot = ?
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
                player.id,
            ],
        );
    }

    async getById(id: number) {
        const [players] = await this.databaseManager.getConnection().query(
            `
        SELECT * FROM game.player WHERE id = ?;
        `,
            [id],
        );

        return this.mapToEntity(players[0]);
    }

    async getByAccountId(accountId: number) {
        const [players] = await this.databaseManager.getConnection().query(
            `
        SELECT * FROM game.player WHERE accountId = ?;
        `,
            [accountId],
        );

        return (players as Array<PlayerState>).map((p) => this.mapToEntity(p));
    }

    async getByAccountIdAndSlot(accountId: number, slot: number) {
        const [players] = await this.databaseManager.getConnection().query(
            `
        SELECT * FROM game.player WHERE accountId = ? and slot = ?;
        `,
            [accountId, slot],
        );

        return this.mapToEntity(players[0]);
    }

    private mapToEntity(player: PlayerState) {
        if (!player) return;

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
        });
    }
}
