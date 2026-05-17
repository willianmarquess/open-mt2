import Monster from '../../entities/game/mob/Monster';
import Player from '../../entities/game/player/Player';

export class VictimQuest {
    private readonly victim: Player | Monster;

    constructor({ victim }: { victim: Player | Monster }) {
        this.victim = victim;
    }

    isPlayer(): boolean {
        return this.victim instanceof Player;
    }

    isMonster(): boolean {
        return this.victim instanceof Monster;
    }

    getLevel(): number {
        return this.victim.getLevel();
    }

    getMonsterId(): number {
        return this.isMonster() ? this.victim.getId() : 0;
    }

    getName(): string {
        return this.victim.getName();
    }
}
