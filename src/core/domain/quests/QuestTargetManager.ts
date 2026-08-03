import { QuestTargetTypeEnum } from '@/core/enum/QuestTargetTypeEnum';
import { Mob } from '../entities/game/mob/Mob';
import Player from '../entities/game/player/Player';
import { EntityManager } from '../manager/EntityManager';

export class QuestTargetManager {
    private readonly entityManager: EntityManager;
    private readonly targetsByPlayer: Map<number, Map<string, number>> = new Map();
    private nextTargetId: number = 0;

    constructor({ entityManager }: { entityManager: EntityManager }) {
        this.entityManager = entityManager;
    }

    removeTarget({ player, questId, targetName }: { player: Player; questId: number; targetName: string }) {
        const targets = this.targetsByPlayer.get(player.getId());

        if (!targets) return;

        const key = QuestTargetManager.createKey(questId, targetName);
        const targetId = targets.get(key);

        if (!targetId) return;

        targets.delete(key);

        if (targets.size === 0) {
            this.targetsByPlayer.delete(player.getId());
        }

        player.sendQuestTargetRemove({ id: targetId });
    }

    sendTargetByVnum({ player, questId, vnum, name }: { player: Player; questId: number; vnum: number; name: string }) {
        const targetsVirtualId = this.entityManager.getEntityByVnum(vnum);

        if (targetsVirtualId.length <= 0) return;

        const targetsCandidate = targetsVirtualId.map((virtualId) => this.entityManager.getEntity<Mob>(virtualId));

        const target = targetsCandidate.find((targetCandidate) => targetCandidate.getArea() === player.getArea());

        if (!target) return;

        player.sendQuestTarget({
            id: this.createTarget({ player, questId, name }),
            targetName: name,
            targetVirtualId: target.getVirtualId(),
            type: QuestTargetTypeEnum.VIRTUAL_ID,
        });
    }

    sendTargetByVirtualId({
        player,
        questId,
        virtualId,
        name,
    }: {
        player: Player;
        questId: number;
        virtualId: number;
        name: string;
    }) {
        const target = this.entityManager.getEntity(virtualId);

        if (!target) return;

        player.sendQuestTarget({
            id: this.createTarget({ player, questId, name }),
            targetName: name,
            targetVirtualId: target.getVirtualId(),
            type: QuestTargetTypeEnum.VIRTUAL_ID,
        });
    }

    private createTarget({ player, questId, name }: { player: Player; questId: number; name: string }): number {
        let targets = this.targetsByPlayer.get(player.getId());

        if (!targets) {
            targets = new Map<string, number>();
            this.targetsByPlayer.set(player.getId(), targets);
        }

        const key = QuestTargetManager.createKey(questId, name);
        const previousTargetId = targets.get(key);

        if (previousTargetId) {
            player.sendQuestTargetRemove({ id: previousTargetId });
        }

        const targetId = ++this.nextTargetId;
        targets.set(key, targetId);

        return targetId;
    }

    private static createKey(questId: number, name: string): string {
        return `${questId}:${name}`;
    }
}
