import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import ListCommand from './ListCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { PrivilegeManager, PrivilegeTypeEnum } from '@/core/domain/manager/PrivilegeManager';
import { EmpireEnum } from '@/core/enum/EmpireEnum';

const empireMapper = {
    [EmpireEnum.BLUE]: 'blue',
    [EmpireEnum.RED]: 'red',
    [EmpireEnum.YELLOW]: 'yellow',
};

const privilegeMapper = {
    [PrivilegeTypeEnum.DROP]: 'drop',
    [PrivilegeTypeEnum.EXP]: 'exp',
    [PrivilegeTypeEnum.GOLD]: 'gold',
    [PrivilegeTypeEnum.GOLD_5]: 'gold5x',
    [PrivilegeTypeEnum.GOLD_10]: 'gold10x',
    [PrivilegeTypeEnum.GOLD_50]: 'gold50x',
};

export default class ListCommandHandler extends CommandHandler<ListCommand> {
    private readonly logger: Logger;
    private readonly world: World;
    private readonly privilegeManager: PrivilegeManager;

    constructor({ logger, world, privilegeManager }) {
        super();
        this.logger = logger;
        this.world = world;
        this.privilegeManager = privilegeManager;
    }

    async execute(player: Player, listCommand: ListCommand) {
        if (!listCommand.isValid()) {
            const errors = listCommand.errors();
            this.logger.error(listCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [type] = listCommand.getArgs();

        switch (type) {
            case 'areas': {
                for (const area of this.world.getAreas().values()) {
                    if (!area.getAka()) continue;
                    player.chat({
                        message: `name: ${area.getName()} | aka: ${area.getAka()} | x: ${area.getPositionX()} | y: ${area.getPositionY()}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }

            case 'players': {
                for (const entity of this.world.getPlayers().values()) {
                    player.chat({
                        message: `name: ${entity.getName()} | x: ${entity.getPositionX()} | y: ${entity.getPositionY()}`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                }
                break;
            }

            case 'privileges': {
                const empiresPrivileges = this.privilegeManager.getEmpiresPrivileges();

                for (const privileges of Object.values(empiresPrivileges)) {
                    for (const { type, target, expirationDate, value } of privileges) {
                        player.chat({
                            message: `Type: ${privilegeMapper[type]} | Empire: ${empireMapper[target]} | privilege value: ${value}% | expiration: ${expirationDate}`,
                            messageType: ChatMessageTypeEnum.INFO,
                        });
                    }
                }
                break;
            }
        }
    }
}
