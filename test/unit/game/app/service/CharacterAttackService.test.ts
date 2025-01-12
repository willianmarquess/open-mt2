import { expect } from 'chai';
import sinon from 'sinon';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import CharacterAttackService from '@/game/app/service/CharacterAttackService';
import Logger from '@/core/infra/logger/Logger';
import World from '@/core/domain/World';
import BattleServiceFactory from '@/core/domain/service/battle/BattleServiceFactory';
import Player from '@/core/domain/entities/game/player/Player';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import Area from '@/core/domain/Area';
import BattleService from '@/core/domain/service/battle/BattleService';

describe('CharacterAttackService', () => {
    let service: CharacterAttackService;
    let logger: sinon.SinonStubbedInstance<Logger>;
    let world: sinon.SinonStubbedInstance<World>;
    let battleServiceFactory: sinon.SinonStubbedInstance<BattleServiceFactory>;
    let player: sinon.SinonStubbedInstance<Player>;
    let victim: sinon.SinonStubbedInstance<Player>;

    beforeEach(() => {
        logger = sinon.createStubInstance(WinstonLoggerAdapter);
        world = sinon.createStubInstance(World);
        battleServiceFactory = sinon.createStubInstance(BattleServiceFactory);
        player = sinon.createStubInstance(Player);
        victim = sinon.createStubInstance(Player);

        service = new CharacterAttackService({
            logger,
            world,
            battleServiceFactory,
        });
    });

    it('should log info when area is not found', async () => {
        player.getPositionX.returns(100);
        player.getPositionY.returns(200);
        world.getAreaByCoordinates.returns(null);

        await service.execute(player, AttackTypeEnum.NORMAL, 1);

        expect(logger.info.calledOnce).to.be.true;
        expect(logger.info.calledWith('[CharacterAttackService] Area not found at x: 100, y: 200')).to.be.true;
    });

    it('should log info when victim is not found', async () => {
        player.getPositionX.returns(100);
        player.getPositionY.returns(200);
        world.getAreaByCoordinates.returns({
            getEntity: sinon.stub().returns(null),
        } as unknown as Area);

        await service.execute(player, AttackTypeEnum.NORMAL, 1);

        expect(logger.info.calledOnce).to.be.true;
        expect(logger.info.calledWith('[CharacterAttackService] Victim not found with virtualId 1')).to.be.true;
    });

    it('should execute battle service when victim is found', async () => {
        player.getPositionX.returns(100);
        player.getPositionY.returns(200);
        const mockArea = {
            getEntity: sinon.stub().returns(victim),
        } as unknown as Area;
        world.getAreaByCoordinates.returns(mockArea);
        const battleService = {
            execute: sinon.stub(),
        } as unknown as BattleService;
        battleServiceFactory.createBattleService.returns(battleService);

        await service.execute(player, AttackTypeEnum.NORMAL, 2);

        expect((battleService.execute as sinon.SinonSpy).calledOnce).to.be.true;
        expect((battleService.execute as sinon.SinonSpy).calledWith(AttackTypeEnum.NORMAL)).to.be.true;
    });
});
