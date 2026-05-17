import PlayerState from '@/core/domain/entities/state/player/PlayerState';

export interface IPlayerRepository {
    create(player: PlayerState): Promise<number>;
    nameAlreadyExists(name: string): Promise<boolean>;
    update(player: PlayerState): Promise<void>;
    getById(id: number): Promise<PlayerState | null>;
    getByAccountId(accountId: number): Promise<PlayerState[]>;
    getByAccountIdAndSlot(accountId: number, slot: number): Promise<PlayerState | null>;
}
