import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export class PlayerQuest {
    private readonly player: Player;

    constructor({ player }: { player: Player }) {
        this.player = player;
    }

    getLevel() {
        return this.player.getLevel();
    }

    getMountVnum() {
        return this.player.getMountVnum();
    }

    getHorseGrade() {
        return this.player.getHorseGrade();
    }

    getHorseLevel() {
        return this.player.getHorseLevel();
    }

    getHorseHealth() {
        return this.player.getHorseHealth();
    }

    reviveHorse() {
        return this.player.reviveHorse();
    }

    addExp(value: number) {
        this.player.addPoint(PointsEnum.EXPERIENCE, value);
    }

    addGold(value: number) {
        this.player.addPoint(PointsEnum.GOLD, value);
    }

    addPoint(point: PointsEnum, value: number) {
        this.player.addPoint(point, value);
    }

    getPoint(point: PointsEnum): number {
        return this.player.getPoint(point);
    }

    chat(text: string): void {
        this.player.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: text,
        });
    }

    getPlayerInstance(): Player {
        return this.player;
    }
}
