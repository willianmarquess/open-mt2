import { expect } from 'chai';
import sinon from 'sinon';
import { QuestTargetManager } from '@/core/domain/quests/QuestTargetManager';

const TARGET_NAME = 'skill_teacher';
const QUEST_ID = 4;
const TARGET_VIRTUAL_ID = 91;

const createPlayer = (id: number) =>
    ({
        getId: () => id,
        getArea: () => 'area',
        sendQuestTarget: sinon.spy(),
        sendQuestTargetRemove: sinon.spy(),
    }) as any;

const entityManager: any = {
    getEntity: () => ({ getVirtualId: () => TARGET_VIRTUAL_ID, getArea: () => 'area' }),
    getEntityByVnum: () => [TARGET_VIRTUAL_ID],
};

describe('QuestTargetManager', () => {
    let questTargetManager: QuestTargetManager;

    beforeEach(() => {
        questTargetManager = new QuestTargetManager({ entityManager });
    });

    const sendTarget = (player: any, questId: number = QUEST_ID, name: string = TARGET_NAME) =>
        questTargetManager.sendTargetByVirtualId({ player, questId, virtualId: TARGET_VIRTUAL_ID, name });

    const removeTarget = (player: any, questId: number = QUEST_ID, name: string = TARGET_NAME) =>
        questTargetManager.removeTarget({ player, questId, targetName: name });

    const sentTargetId = (player: any) => player.sendQuestTarget.lastCall.args[0].id;

    it('should remove the marker the player was given, not the one another player got last', () => {
        const first = createPlayer(1);
        const second = createPlayer(2);

        sendTarget(first);
        sendTarget(second);

        const firstTargetId = sentTargetId(first);
        removeTarget(first);

        expect(first.sendQuestTargetRemove.calledOnceWith({ id: firstTargetId })).to.be.equal(true);
    });

    it('should leave the other players markers alone', () => {
        const first = createPlayer(1);
        const second = createPlayer(2);

        sendTarget(first);
        sendTarget(second);

        const secondTargetId = sentTargetId(second);
        removeTarget(first);
        removeTarget(second);

        expect(second.sendQuestTargetRemove.calledOnceWith({ id: secondTargetId })).to.be.equal(true);
    });

    it('should forget a target once it is removed', () => {
        const player = createPlayer(1);

        sendTarget(player);
        removeTarget(player);
        removeTarget(player);

        expect(player.sendQuestTargetRemove.calledOnce).to.be.equal(true);
    });

    it('should keep targets of different quests apart even under the same name', () => {
        const player = createPlayer(1);

        sendTarget(player, QUEST_ID);
        const firstTargetId = sentTargetId(player);
        sendTarget(player, QUEST_ID + 1);

        removeTarget(player, QUEST_ID);

        expect(player.sendQuestTargetRemove.calledOnceWith({ id: firstTargetId })).to.be.equal(true);
    });

    it('should replace a target sent twice instead of leaving the old marker drawn', () => {
        const player = createPlayer(1);

        sendTarget(player);
        const firstTargetId = sentTargetId(player);
        sendTarget(player);

        expect(player.sendQuestTargetRemove.calledOnceWith({ id: firstTargetId })).to.be.equal(true);
        expect(sentTargetId(player)).to.not.be.equal(firstTargetId);
    });

    it('should do nothing when removing a target the player never had', () => {
        const player = createPlayer(1);

        expect(() => removeTarget(player)).to.not.throw();
        expect(player.sendQuestTargetRemove.called).to.be.equal(false);
    });

    it('should send the target by vnum with the resolved virtual id', () => {
        const player = createPlayer(1);

        questTargetManager.sendTargetByVnum({ player, questId: QUEST_ID, vnum: 20345, name: TARGET_NAME });

        expect(player.sendQuestTarget.calledOnce).to.be.equal(true);
        expect(player.sendQuestTarget.lastCall.args[0].targetVirtualId).to.be.equal(TARGET_VIRTUAL_ID);
    });
});
