import Result from "../../../core/app/Result.js";
import ErrorTypesEnum from "../../../core/enum/ErrorTypesEnum.js";
import CacheKeyGenerator from "../../../core/util/CacheKeyGenerator.js";

const MAX_PLAYERS_PER_ACCOUNT = 4;

interface CreateCharacterInput {
  playerName: string;
  playerClass: number;
  appearance: number;
  slot: number;
  accountId: number;
}

export default class CreateCharacterService {
  private logger: any;
  private cacheProvider: any;
  private playerRepository: any;
  private playerFactory: any;

  constructor({ logger, cacheProvider, playerRepository, playerFactory }) {
    this.logger = logger;
    this.cacheProvider = cacheProvider;
    this.playerRepository = playerRepository;
    this.playerFactory = playerFactory;
  }

  /**
   * Executes the character creation process.
   * @param {CreateCharacterInput} [createCharacterInput=createCharacterInputDefault] - The input for creating a character.
   * @returns {Promise<Result>} A promise that resolves to a result with error or ok value.
   */
  async execute(createCharacterInput) {
    const { playerName, playerClass, appearance, slot, accountId } = createCharacterInput;
    const nameAlreadyExists = await this.playerRepository.nameAlreadyExists(playerName);

    if (nameAlreadyExists) {
      this.logger.info(`[CreateCharacterService] The player name: ${playerName} already exists.`);
      return Result.error(ErrorTypesEnum.NAME_ALREADY_EXISTS);
    }

    const players = await this.playerRepository.getByAccountId(accountId);

    if (players.length > MAX_PLAYERS_PER_ACCOUNT) {
      this.logger.info(`[CreateCharacterService] The player account is full`);
      return Result.error(ErrorTypesEnum.ACCOUNT_FULL);
    }

    const key = CacheKeyGenerator.createEmpireKey(accountId);
    const empireIdExists = await this.cacheProvider.exists(key);

    if (!empireIdExists) {
      this.logger.info(`[CreateCharacterService] The empire was not selected before.`);
      return Result.error(ErrorTypesEnum.EMPIRE_NOT_SELECTED);
    }

    const empireId = await this.cacheProvider.get(key);

    const player = this.playerFactory.create({
      playerClass,
      empire: empireId,
      name: playerName,
      accountId,
      appearance,
      slot,
    });

    const playerId = await this.playerRepository.create(player.toDatabase());
    player.id = playerId;

    return Result.ok(player);
  }
}
