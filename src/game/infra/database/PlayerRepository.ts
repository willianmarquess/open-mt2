import PlayerDTO from "../../../core/domain/dto/PlayerDTO.js";
import Player from "../../../core/domain/entities/game/player/Player.js";
import DatabaseManager from "../../../core/infra/database/DatabaseManager.js";

export default class PlayerRepository {
  constructor(private readonly databaseManager: DatabaseManager) {}

  async create(player: Player) {
    const [result] = await this.#databaseManager.connection.query(
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

  async getById(id) {
    const [players] = await this.#databaseManager.connection.query(
      `
        SELECT * FROM game.player WHERE id = ?;
        `,
      [id],
    );

    return this.#mapToEntity(players[0]);
  }

  async getByAccountId(accountId) {
    const [players] = await this.#databaseManager.connection.query(
      `
        SELECT * FROM game.player WHERE accountId = ?;
        `,
      [accountId],
    );

    return players.map((p) => this.#mapToEntity(p));
  }

  async getByAccountIdAndSlot(accountId, slot) {
    const [players] = await this.#databaseManager.connection.query(
      `
        SELECT * FROM game.player WHERE accountId = ? and slot = ?;
        `,
      [accountId, slot],
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
      slot,
    } = player;

    return new PlayerDTO({
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
