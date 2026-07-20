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
        if (player.quickSlot.size > 0) {
            await this.bulkUpsertQuickSlots(player);
        }
        return result.insertId;
    }

    async nameAlreadyExists(name: string): Promise<boolean> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE name = ?;`, [name]);

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
        if (player.quickSlot.size > 0) {
            await this.bulkUpsertQuickSlots(player);
        }
    }

    private async getQuickSlots(playerId: number): Promise<Map<number, { type: number; position: number }>> {
        const [quickSlots] = await this.databaseManager
            .getConnection()
            .query<RowDataPacket[]>(`SELECT slot, type, position FROM game.quick_slot WHERE playerId = ?;`, [playerId]);

        const quickSlotMap = new Map<number, { type: number; position: number }>();
        for (const quickSlot of quickSlots) {
            quickSlotMap.set(quickSlot.slot, { type: quickSlot.type, position: quickSlot.position });
        }

        return quickSlotMap;
    }

    async getById(id: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE id = ?;`, [id]);

        if (players.length === 0) {
            return null;
        }

        const [player] = players;

        const quickSlot = await this.getQuickSlots(player.id);

        return this.mapToEntity(player, quickSlot);
    }

    async getByAccountId(accountId: number): Promise<PlayerState[]> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE accountId = ?;`, [accountId]);

        const quickSlots = await Promise.all(players.map((p) => this.getQuickSlots(p.id)));

        return players.map((p, i) => this.mapToEntity(p, quickSlots[i])) as PlayerState[];
    }

    async getByAccountIdAndSlot(accountId: number, slot: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE accountId = ? and slot = ?;`, [accountId, slot]);

        if (players.length === 0) {
            return null;
        }

        const [player] = players;

        const quickSlot = await this.getQuickSlots(player.id);

        return this.mapToEntity(player, quickSlot);
    }

    private async bulkUpsertQuickSlots(player: PlayerState): Promise<void> {
        const { id: playerId, quickSlot: quickSlots } = player;
        if (quickSlots.size === 0) return;

        const values: (number | string)[] = [];
        const placeholders: string[] = [];

        for (const [slot, quickSlot] of quickSlots.entries()) {
            placeholders.push('(?, ?, ?, ?)');
            values.push(playerId, slot, quickSlot.type, quickSlot.position);
        }

        await this.databaseManager
            .getConnection()
            .query<ResultSetHeader>(`DELETE FROM game.quick_slot WHERE playerId = ?;`, [playerId]);

        await this.databaseManager.getConnection().query<ResultSetHeader>(
            `
            INSERT INTO game.quick_slot (playerId, slot, type, position)
            VALUES ${placeholders.join(', ')}
            ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                position = VALUES(position);
            `,
            values,
        );
    }

    private mapToEntity(
        player?: PlayerRow,
        quickSlot?: Map<number, { type: number; position: number }>,
    ): PlayerState | null {
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
            quickSlot,
        });
    }
}
