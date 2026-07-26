import { expect } from 'chai';
import sinon from 'sinon';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import CharacterAttackService from '@/game/app/service/CharacterAttackService';
import Logger from '@/core/infra/logger/Logger';
import Player from '@/core/domain/entities/game/player/Player';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import { EntityManager } from '@/core/domain/manager/EntityManager';

describe('CharacterAttackService', () => {
    let service: CharacterAttackService;
    let logger: sinon.SinonStubbedInstance<Logger>;
    let player: sinon.SinonStubbedInstance<Player>;
    let victim: sinon.SinonStubbedInstance<Player>;
    let entityManager: sinon.SinonStubbedInstance<EntityManager>;

    beforeEach(() => {
        logger = sinon.createStubInstance(WinstonLoggerAdapter);
        player = sinon.createStubInstance(Player);
        victim = sinon.createStubInstance(Player);
        entityManager = sinon.createStubInstance(EntityManager);

        service = new CharacterAttackService({
            logger,
            entityManager,
        });
    });

    it('should log info when victim is not found', async () => {
        player.getPositionX.returns(100);
        player.getPositionY.returns(200);
        entityManager.getEntity.returns(null as any);

        await service.execute(player, AttackTypeEnum.NORMAL, 1);

        expect(logger.info.calledOnce).to.be.true;
        expect(logger.info.calledWith('[CharacterAttackService] Victim not found with virtualId 1')).to.be.true;
    });

    it('should execute battle service when victim is found', async () => {
        player.getPositionX.returns(100);
        player.getPositionY.returns(200);
        entityManager.getEntity.returns(victim);

        await service.execute(player, AttackTypeEnum.NORMAL, 2);
    });
});
