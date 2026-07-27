import { PointsEnum } from '@/core/enum/PointsEnum';
import Player from '../../entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { AssasinSubJobEnum, ShamanSubJobEnum, SuraSubJobEnum, WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import { EmpireEnum } from '@/core/enum/EmpireEnum';

export class PlayerQuest {
    private readonly player: Player;

    constructor({ player }: { player: Player }) {
        this.player = player;
    }

    getLevel() {
        return this.player.getLevel();
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

    isSura(): boolean {
        return this.player.isSura();
    }

    isWarrior(): boolean {
        return this.player.isWarrior();
    }

    isAssassin(): boolean {
        return this.player.isAssassin();
    }

    isShaman(): boolean {
        return this.player.isShaman();
    }

    isFromRed(): boolean {
        return this.player.getEmpire() === EmpireEnum.RED;
    }

    isFromBlue(): boolean {
        return this.player.getEmpire() === EmpireEnum.BLUE;
    }

    isFromYellow(): boolean {
        return this.player.getEmpire() === EmpireEnum.YELLOW;
    }

    setSkillGroup(subJob: WarriorSubJobEnum | SuraSubJobEnum | AssasinSubJobEnum | ShamanSubJobEnum) {
        return this.player.setSkillGroup(subJob);
    }

    hasSkillGroup(): boolean {
        return this.player.getSkillGroup() !== 0;
    }
}
