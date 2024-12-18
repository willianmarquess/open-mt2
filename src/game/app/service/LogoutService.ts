import Player from '@/core/domain/entities/game/player/Player';
import LeaveGameService from '@/game/domain/service/LeaveGameService';

export default class LogoutService {
    private readonly leaveGameService: LeaveGameService;

    constructor({ leaveGameService }) {
        this.leaveGameService = leaveGameService;
    }

    async execute(player: Player) {
        await this.leaveGameService.execute(player);
    }
}
