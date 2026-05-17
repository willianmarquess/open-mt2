import NPC from '../../entities/game/mob/NPC';

export class NpcQuest {
    private readonly npc: NPC;

    constructor({ npc }: { npc: NPC }) {
        this.npc = npc;
    }

    getLevel() {
        return this.npc.getLevel();
    }

    getId() {
        return this.npc.getId();
    }
}
