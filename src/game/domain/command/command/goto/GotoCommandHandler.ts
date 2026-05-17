import Logger from '@/core/infra/logger/Logger';
import CommandHandler from '../../CommandHandler';
import GotoCommand from './GotoCommand';
import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import EmpireUtil from '@/core/domain/util/EmpireUtil';
import Area from '@/core/domain/Area';

export default class GotoCommandHandler extends CommandHandler<GotoCommand> {
    private readonly logger: Logger;
    private readonly world: World;

    constructor({ logger, world }: { logger: Logger; world: World }) {
        super();
        this.logger = logger;
        this.world = world;
    }

    async execute(player: Player, gotoCommand: GotoCommand) {
        if (!gotoCommand.isValid()) {
            const errors = gotoCommand.errors();
            this.logger.error(gotoCommand.getErrorMessage());
            player.sendCommandErrors(errors);
            return;
        }

        const [type, ...params] = gotoCommand.getArgs();

        switch (type) {
            case 'area':
                {
                    const [areaName] = params;
                    const areaByName = this.world.getAreaByName(areaName);

                    if (!areaByName) {
                        player.chat({
                            message: `Area: ${areaName} not found.`,
                            messageType: ChatMessageTypeEnum.INFO,
                        });
                        return;
                    }

                    const [x, y] = this.getAreaCoordinates(areaByName, player);

                    this.logger.debug(
                        `[GotoCommandHandler] Teleport ${player.getName()} to area: ${areaByName.getName()}, x: ${x}, y: ${y}`,
                    );

                    this.world.despawn(player);
                    player.teleport(x, y);
                }
                break;

            case 'player': {
                const [targetName] = params;
                const target = this.world.getPlayerByName(targetName);

                if (!target) {
                    player.chat({
                        message: `Target: ${targetName} not found.`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }

                this.world.despawn(player);
                player.teleport(target.getPositionX() + 200, target.getPositionY() + 200);
                break;
            }

            case 'location': {
                const [x, y] = params;
                const areaByLocation = this.world.getAreaByCoordinates(Number(x), Number(y));

                if (!areaByLocation) {
                    player.chat({
                        message: `Area in x: ${x} and y: ${y} not found.`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }

                this.world.despawn(player);
                player.teleport(Number(x), Number(y));
                break;
            }
        }
    }

    private getAreaCoordinates(area: Area, player: Player): [number, number] {
        const goto = area.getGoto();
        if (goto) {
            const empireName = EmpireUtil.getEmpireName(player.getEmpire());
            return goto[empireName] || goto.default!;
        }
        return [
            area.getPositionX() + (area.getWidth() * 25600) / 2,
            area.getPositionY() + (area.getHeight() * 25600) / 2,
        ];
    }
}
