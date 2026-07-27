import { QuestTargetTypeEnum } from '@/core/enum/QuestTargetTypeEnum';
import { Mob } from '../entities/game/mob/Mob';
import Player from '../entities/game/player/Player';
import { EntityManager } from '../manager/EntityManager';

export class QuestTarget {
    private readonly entityManager: EntityManager;
    private readonly targets: Map<string, number> = new Map();
    private nextTargetId: number = 0;

    constructor({ entityManager }: { entityManager: EntityManager }) {
        this.entityManager = entityManager;
    }

    removeTarget({ player, targetName }: { player: Player; targetName: string }) {
        const targetId = this.targets.get(targetName);

        if (!targetId) return;

        player.sendQuestTargetRemove({ id: targetId });
    }

    sendTargetByVnum({ player, vnum, name }: { player: Player; vnum: number; name: string }) {
        const targetsVirtualId = this.entityManager.getEntityByVnum(vnum);

        if (targetsVirtualId.length <= 0) return;

        const targetsCandidate = targetsVirtualId.map((virtualId) => this.entityManager.getEntity<Mob>(virtualId));

        const target = targetsCandidate.find((targetCandidate) => targetCandidate.getArea() === player.getArea());

        if (!target) return;

        const targetId = this.nextTargetId++;

        this.targets.set(name, targetId);

        player.sendQuestTarget({
            id: targetId,
            targetName: name,
            targetVirtualId: target.getVirtualId(),
            type: QuestTargetTypeEnum.VIRTUAL_ID,
        });
    }

    sendTargetByVirtualId({ player, virtualId, name }: { player: Player; virtualId: number; name: string }) {
        const target = this.entityManager.getEntity(virtualId);

        if (!target) return;

        const targetId = this.nextTargetId++;

        this.targets.set(name, targetId);

        player.sendQuestTarget({
            id: targetId,
            targetName: name,
            targetVirtualId: target.getVirtualId(),
            type: QuestTargetTypeEnum.VIRTUAL_ID,
        });
    }
}
