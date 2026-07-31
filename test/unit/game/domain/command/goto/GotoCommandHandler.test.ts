import { expect } from 'chai';
import sinon from 'sinon';
import Player from '@/core/domain/entities/game/player/Player';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import GotoCommandHandler from '@/game/domain/command/command/goto/GotoCommandHandler';
import GotoCommand from '@/game/domain/command/command/goto/GotoCommand';
import World from '@/core/domain/World';

describe('GotoCommandHandler', () => {
    let logger: sinon.SinonStubbedInstance<WinstonLoggerAdapter>;
    let world: sinon.SinonStubbedInstance<World>;
    let handler: GotoCommandHandler;
    let player: sinon.SinonStubbedInstance<Player>;
    let command: sinon.SinonStubbedInstance<GotoCommand>;

    beforeEach(() => {
        logger = sinon.createStubInstance(WinstonLoggerAdapter);
        world = sinon.createStubInstance(World);
        handler = new GotoCommandHandler({ logger, world });
        player = sinon.createStubInstance(Player);
        command = sinon.createStubInstance(GotoCommand);
        command.isValid.returns(true);
        command.getArgs.returns(['location', '200000', '300000']);
        world.getAreaByCoordinates.returns({} as any);
    });

    afterEach(() => sinon.restore());

    it('should despawn from the origin before the position changes (issue #88)', async () => {
        player.canTeleport.returns(true);

        await handler.execute(player, command);

        expect(world.despawn.calledOnceWith(player)).to.be.true;
        expect(player.teleport.calledOnceWith(200000, 300000)).to.be.true;
        sinon.assert.callOrder(world.despawn, player.teleport);
    });

    it('should not despawn when the teleport is refused, so the player is not left in limbo (issue #88)', async () => {
        player.canTeleport.returns(false);

        await handler.execute(player, command);

        expect(world.despawn.called, 'a refused teleport must not remove the player from the world').to.be.false;
        expect(player.teleport.calledOnceWith(200000, 300000), 'teleport still delivers its refusal message').to.be
            .true;
    });

    it('should warp next to the target player through the same guarded path', async () => {
        const target = sinon.createStubInstance(Player);
        target.getPositionX.returns(500000);
        target.getPositionY.returns(600000);
        world.getPlayerByName.returns(target);
        command.getArgs.returns(['player', 'friend']);
        player.canTeleport.returns(true);

        await handler.execute(player, command);

        expect(world.despawn.calledOnceWith(player)).to.be.true;
        expect(player.teleport.calledOnceWith(500200, 600200)).to.be.true;
    });
});
