import LeaveGameService from '../../domain/service/LeaveGameService.js';

export default class LogoutService {
    constructor(private readonly leaveGameService: LeaveGameService) {}

    async execute(player) {
        await this.leaveGameService.execute(player);
    }
}
