export default class LogoutService {
    #leaveGameService;

    constructor({ leaveGameService }) {
        this.#leaveGameService = leaveGameService;
    }

    async execute(player) {
        await this.#leaveGameService.execute(player);
    }
}
