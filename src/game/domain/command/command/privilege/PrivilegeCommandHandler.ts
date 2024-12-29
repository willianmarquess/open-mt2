import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import Player from '@/core/domain/entities/game/player/Player';
import PrivilegeCommand from './PrivilegeCommand';
import { PrivilegeManager, PrivilegeTypeEnum } from '@/core/domain/manager/PrivilegeManager';
import { EmpireEnum } from '@/core/enum/EmpireEnum';
import World from '@/core/domain/World';

const privilegeTypeMapper = {
    gold: PrivilegeTypeEnum.GOLD,
    drop: PrivilegeTypeEnum.DROP,
    gold5: PrivilegeTypeEnum.GOLD_5,
    gold10: PrivilegeTypeEnum.GOLD_10,
    gold50: PrivilegeTypeEnum.GOLD_50,
    exp: PrivilegeTypeEnum.EXP,
};

const empireMapper = {
    red: EmpireEnum.RED,
    blue: EmpireEnum.BLUE,
    yellow: EmpireEnum.YELLOW,
};

export default class PrivilegeCommandHandler extends CommandHandler<PrivilegeCommand> {
    private readonly logger: Logger;
    private readonly privilegeManager: PrivilegeManager;
    private readonly world: World;

    constructor({ logger, privilegeManager, world }) {
        super();
        this.logger = logger;
        this.privilegeManager = privilegeManager;
        this.world = world;
    }

    async execute(player: Player, privilegeCommand: PrivilegeCommand) {
        if (!privilegeCommand.isValid()) {
            const errors = privilegeCommand.errors();
            this.logger.error(privilegeCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [kind, name, type, value = 1, timeInSeconds = 60 * 60] = privilegeCommand.getArgs();
        const privilegeType = privilegeTypeMapper[type];

        switch (kind) {
            case 'player': {
                if (!name) {
                    player.sendCommandErrors(['Player name is required']);
                    return;
                }
                const target = this.world.getPlayerByName(name);

                if (!target) {
                    player.sendCommandErrors(['Player not found']);
                    return;
                }

                this.privilegeManager.addPlayerPrivilege(target, privilegeType, Number(timeInSeconds), Number(value));
                break;
            }
            case 'empire': {
                const empire = empireMapper[name];
                if (!empire) {
                    player.sendCommandErrors(['Invalid empire name: empire must be red, blue or yellow']);
                    return;
                }
                this.privilegeManager.addEmpirePrivilege(empire, privilegeType, Number(timeInSeconds), Number(value));
                break;
            }
            case 'guild': {
                player.sendCommandErrors(['Not implemented yet']);
                break;
            }
        }
    }
}
