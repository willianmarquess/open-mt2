import { expect } from 'chai';
import sinon from 'sinon';
import Player from '@/core/domain/entities/game/player/Player';
import { EmpireEnum } from '@/core/enum/EmpireEnum';
import WinstonLoggerAdapter from '@/core/infra/logger/WinstonLoggerAdapter';
import { PrivilegeManager, PrivilegeTypeEnum } from '@/core/domain/manager/PrivilegeManager';
import PrivilegeCommandHandler from '@/game/domain/command/command/privilege/PrivilegeCommandHandler';
import PrivilegeCommand from '@/game/domain/command/command/privilege/PrivilegeCommand';
import World from '@/core/domain/World';

describe('PrivilegeCommandHandler', () => {
    let logger: sinon.SinonStubbedInstance<WinstonLoggerAdapter>;
    let privilegeManager: sinon.SinonStubbedInstance<PrivilegeManager>;
    let world: sinon.SinonStubbedInstance<World>;
    let handler: PrivilegeCommandHandler;
    let player: sinon.SinonStubbedInstance<Player>;
    let command: sinon.SinonStubbedInstance<PrivilegeCommand>;

    beforeEach(() => {
        logger = sinon.createStubInstance(WinstonLoggerAdapter);
        privilegeManager = sinon.createStubInstance(PrivilegeManager);
        world = sinon.createStubInstance(World);
        handler = new PrivilegeCommandHandler({ logger, privilegeManager, world });
        player = sinon.createStubInstance(Player);
        command = sinon.createStubInstance(PrivilegeCommand);
    });

    afterEach(() => sinon.restore());

    it('should log an error and send command errors if the command is invalid', async () => {
        command.isValid.returns(false);
        command.errors.returns([{ name: 'Invalid command', errors: [], value: '' }]);
        command.getErrorMessage.returns('Invalid privilege command');

        await handler.execute(player, command);

        expect(logger.error.calledOnceWith('Invalid privilege command')).to.be.true;
        expect(player.sendCommandErrors.calledOnceWith([{ name: 'Invalid command', errors: [], value: '' }])).to.be
            .true;
    });

    it("should add a player privilege if the kind is 'player' when player exists", async () => {
        const target = sinon.createStubInstance(Player);
        world.getPlayerByName.returns(target);
        command.isValid.returns(true);
        command.getArgs.returns(['player', 'test', 'gold', '5', '3600']);

        await handler.execute(player, command);

        expect(privilegeManager.addPlayerPrivilege.calledOnceWith(target, PrivilegeTypeEnum.GOLD, 3600, 5)).to.be.true;
    });

    it("should not add a player privilege if the kind is 'player' when player not exists", async () => {
        world.getPlayerByName.returns(undefined);
        command.isValid.returns(true);
        command.getArgs.returns(['player', 'test', 'gold', '5', '3600']);

        await handler.execute(player, command);

        expect(privilegeManager.addPlayerPrivilege.calledOnce).to.be.false;
    });

    it("should add an empire privilege if the kind is 'empire' and name is valid", async () => {
        command.isValid.returns(true);
        command.getArgs.returns(['empire', 'red', 'gold', '10', '7200']);

        await handler.execute(player, command);

        expect(privilegeManager.addEmpirePrivilege.calledOnceWith(EmpireEnum.RED, PrivilegeTypeEnum.GOLD, 7200, 10)).to
            .be.true;
    });

    it("should send command errors if the kind is 'empire' and name is invalid", async () => {
        command.isValid.returns(true);
        command.getArgs.returns(['empire', 'invalidEmpire', 'gold', '10', '7200']);

        await handler.execute(player, command);

        expect(player.sendCommandErrors.calledOnceWith(['Invalid empire name: empire must be red, blue or yellow'])).to
            .be.true;
        expect(privilegeManager.addEmpirePrivilege.notCalled).to.be.true;
    });

    it("should send command errors if the kind is 'guild'", async () => {
        command.isValid.returns(true);
        command.getArgs.returns(['guild', '', 'gold', '10', '7200']);

        await handler.execute(player, command);

        expect(player.sendCommandErrors.calledOnceWith(['Not implemented yet'])).to.be.true;
    });

    it('should not throw if the privilege type is invalid', async () => {
        command.isValid.returns(true);
        command.getArgs.returns(['player', '', 'invalidType', '10', '7200']);

        await handler.execute(player, command);

        expect(privilegeManager.addPlayerPrivilege.notCalled).to.be.true;
    });
});
