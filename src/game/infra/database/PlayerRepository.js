import Player from '../../../core/domain/entities/Player.js';

export default class PlayerRepository {
    #databaseManager;

    constructor({ databaseManager }) {
        this.#databaseManager = databaseManager;
    }

    async create(player) {
        return this.#databaseManager.connection.query(
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
            availableStatusPoints
        )
            values
        (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
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
            ],
        );
    }

    async nameAlreadyExists(name) {
        const [players] = await this.#databaseManager.connection.query(
            `
        SELECT * FROM game.player WHERE name = ?;
        `,
            [name],
        );

        return !!players[0];
    }

    async update(player) {
        return this.#databaseManager.connection.query(
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
            availableStatusPoints = ?
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
                player.id,
            ],
        );
    }

    async getById(id) {
        const [players] = await this.#databaseManager.connection.query(
            `
        SELECT * FROM game.player WHERE id = ?;
        `,
            [id],
        );

        return this.#mapToEntity(players[0]);
    }

    #mapToEntity(player) {
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
        } = player;

        return Player.create({
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
        });
    }
}
