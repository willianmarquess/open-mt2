import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { PlayerState, SkillState } from '@/core/domain/entities/state/player/PlayerState';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';

type PlayerRow = RowDataPacket & PlayerState;
type QuickSlotEntry = { slot: number; type: number; position: number };

export default class PlayerRepository implements IPlayerRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }: { databaseManager: DatabaseManager }) {
        this.databaseManager = databaseManager;
    }

    async create(player: PlayerState) {
        const fields = this.getWriteFields(player);
        const columns = Object.keys(fields);
        const [result] = await this.databaseManager
            .getConnection()
            .execute<ResultSetHeader>(
                `INSERT INTO game.player (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')});`,
                Object.values(fields),
            );
        return result.insertId;
    }

    async nameAlreadyExists(name: string): Promise<boolean> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE name = ? AND deletedAt IS NULL;`, [name]);

        return players.length > 0;
    }

    async softDelete(id: number): Promise<void> {
        await this.databaseManager
            .getConnection()
            .query<ResultSetHeader>(`UPDATE game.player SET deletedAt = NOW() WHERE id = ?;`, [id]);
    }

    private getSkillJson(skills: Array<SkillState>): string {
        let skillsJson: string = '[]';
        try {
            skillsJson = JSON.stringify(skills);
        } catch (error) {
            console.error('Error serializing skills:', error);
        }
        return skillsJson;
    }

    /** Mirrors getSkillJson's pattern: a Map isn't itself JSON-serializable, so it's flattened into
     * an array of {slot, type, position} entries first (only the slots actually set, keeping the
     * column small), then reconstructed back into a Map in mapToEntity. */
    private getQuickSlotJson(quickSlot: Map<number, { type: number; position: number }>): string {
        let quickSlotJson: string = '[]';
        try {
            const entries: Array<QuickSlotEntry> = Array.from(quickSlot.entries()).map(
                ([slot, { type, position }]) => ({
                    slot,
                    type,
                    position,
                }),
            );
            quickSlotJson = JSON.stringify(entries);
        } catch (error) {
            console.error('Error serializing quick slots:', error);
        }
        return quickSlotJson;
    }

    async update(player: PlayerState) {
        const fields = this.getWriteFields(player);
        const assignments = Object.keys(fields).map((column) => `${column} = ?`);
        await this.databaseManager
            .getConnection()
            .query<ResultSetHeader>(`UPDATE game.player SET ${assignments.join(', ')} WHERE id = ?;`, [
                ...Object.values(fields),
                player.id,
            ]);
    }

    private getWriteFields(player: PlayerState) {
        return {
            accountId: player.accountId,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,
            empire: player.empire,
            playerClass: player.playerClass,
            skillGroup: player.skillGroup,
            playTime: player.playTime,
            level: player.level,
            experience: player.experience,
            gold: player.gold,
            st: player.st,
            ht: player.ht,
            dx: player.dx,
            iq: player.iq,
            positionX: player.positionX,
            positionY: player.positionY,
            health: player.health,
            mana: player.mana,
            stamina: player.stamina,
            bodyPart: player.bodyPart,
            hairPart: player.hairPart,
            name: player.name,
            givenStatusPoints: player.givenStatusPoints,
            availableStatusPoints: player.availableStatusPoints,
            availableSkillPoints: player.availableSkillPoints,
            subSkill: player.subSkill,
            slot: player.slot,
            horseLevel: player.horseLevel,
            horseHealth: player.horseHealth,
            horseStamina: player.horseStamina,
            horseName: player.horseName,
            horseRiding: player.horseRiding,
            skills: this.getSkillJson(player.skills),
            quickSlot: this.getQuickSlotJson(player.quickSlot),
        };
    }

    async getById(id: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE id = ? AND deletedAt IS NULL;`, [id]);

        if (players.length === 0) {
            return null;
        }

        const [player] = players;

        return this.mapToEntity(player);
    }

    async getByAccountId(accountId: number): Promise<PlayerState[]> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<PlayerRow[]>(`SELECT * FROM game.player WHERE accountId = ? AND deletedAt IS NULL;`, [accountId]);

        return players.map((p) => this.mapToEntity(p)) as PlayerState[];
    }

    async getByAccountIdAndSlot(accountId: number, slot: number): Promise<PlayerState | null> {
        const [players] = await this.databaseManager
            .getConnection()
            .query<
                PlayerRow[]
            >(`SELECT * FROM game.player WHERE accountId = ? and slot = ? AND deletedAt IS NULL;`, [accountId, slot]);

        if (players.length === 0) {
            return null;
        }

        const [player] = players;

        return this.mapToEntity(player);
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
            horseRiding,
            availableSkillPoints,
            subSkill,
            skills,
            quickSlot,
        } = player;

        const quickSlotEntries = (quickSlot ?? []) as unknown as Array<QuickSlotEntry>;
        const quickSlotMap = new Map<number, { type: number; position: number }>();
        for (const { slot: quickSlotIndex, type, position } of quickSlotEntries) {
            quickSlotMap.set(quickSlotIndex, { type, position });
        }

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
            quickSlot: quickSlotMap,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName,
            horseRiding,
            availableSkillPoints,
            subSkill,
            skills,
        });
    }
}
