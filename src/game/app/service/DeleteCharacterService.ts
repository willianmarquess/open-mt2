import Result from '@/core/domain/util/Result';
import { ErrorTypesEnum } from '@/core/enum/ErrorTypesEnum';
import Logger from '@/core/infra/logger/Logger';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';
import AccountRepository from '@/game/infra/database/AccountRepository';

type DeleteCharacterServiceParams = {
    accountId: number;
    slot: number;
    privateCode: string;
};

export default class DeleteCharacterService {
    private readonly logger: Logger;
    private readonly playerRepository: IPlayerRepository;
    private readonly accountRepository: AccountRepository;

    constructor({
        logger,
        playerRepository,
        accountRepository,
    }: {
        logger: Logger;
        playerRepository: IPlayerRepository;
        accountRepository: AccountRepository;
    }) {
        this.logger = logger;
        this.playerRepository = playerRepository;
        this.accountRepository = accountRepository;
    }

    async execute({
        accountId,
        slot,
        privateCode,
    }: DeleteCharacterServiceParams): Promise<Result<void, ErrorTypesEnum>> {
        const deleteCode = await this.accountRepository.getDeleteCodeById(accountId);

        if (!deleteCode || deleteCode !== privateCode) {
            this.logger.info(`[DeleteCharacterService] Invalid delete code for accountId: ${accountId}`);
            return Result.error(ErrorTypesEnum.INVALID_DELETE_CODE);
        }

        const player = await this.playerRepository.getByAccountIdAndSlot(accountId, slot);

        if (!player) {
            this.logger.info(`[DeleteCharacterService] No character on slot: ${slot}, accountId: ${accountId}`);
            return Result.error(ErrorTypesEnum.PLAYER_NOT_FOUND);
        }

        await this.playerRepository.softDelete(player.id);
        this.logger.info(
            `[DeleteCharacterService] Character deleted: id: ${player.id}, name: ${player.name}, accountId: ${accountId}`,
        );

        return Result.ok();
    }
}
