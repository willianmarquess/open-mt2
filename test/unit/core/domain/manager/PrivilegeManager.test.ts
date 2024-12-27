import Player from '@/core/domain/entities/game/player/Player';
import { PrivilegeManager, PrivilegeTypeEnum } from '@/core/domain/manager/PrivilegeManager';
import { EmpireEnum } from '@/core/enum/EmpireEnum';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PrivilegeManager', () => {
    let privilegeManager: PrivilegeManager;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        privilegeManager = new PrivilegeManager();
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should add and retrieve a player privilege', () => {
        const player = { getId: () => 1 } as unknown as Player;
        privilegeManager.addPlayerPrivilege(player, PrivilegeTypeEnum.EXP, 10, 100);

        const privilegeValue = privilegeManager.getPlayerPrivilege(player, PrivilegeTypeEnum.EXP);
        expect(privilegeValue).to.equal(100);
    });

    it('should add and retrieve an empire privilege', () => {
        privilegeManager.addEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD, 10, 200);

        const privilegeValue = privilegeManager.getEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD);
        expect(privilegeValue).to.equal(200);
    });

    it('should expire player privileges after the specified time', () => {
        const player = { getId: () => 1 } as unknown as Player;
        privilegeManager.addPlayerPrivilege(player, PrivilegeTypeEnum.EXP, 10, 100);

        clock.tick(10000);
        privilegeManager.tick();

        const privilegeValue = privilegeManager.getPlayerPrivilege(player, PrivilegeTypeEnum.EXP);
        expect(privilegeValue).to.be.equal(0);
    });

    it('should expire empire privileges after the specified time', () => {
        privilegeManager.addEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD, 10, 200);

        clock.tick(10000);
        privilegeManager.tick();

        const privilegeValue = privilegeManager.getEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD);
        expect(privilegeValue).to.be.equal(0);
    });

    it('should throw an error for invalid player privilege parameters', () => {
        const player = { getId: () => 1 } as unknown as Player;

        expect(() => privilegeManager.addPlayerPrivilege(player, PrivilegeTypeEnum.EXP, -1, 100)).to.throw(
            'Invalid privilege parameters',
        );
        expect(() => privilegeManager.addPlayerPrivilege(player, PrivilegeTypeEnum.EXP, 10, -100)).to.throw(
            'Invalid privilege parameters',
        );
    });

    it('should throw an error for invalid empire privilege parameters', () => {
        expect(() => privilegeManager.addEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD, -1, 200)).to.throw(
            'Invalid privilege parameters',
        );
        expect(() => privilegeManager.addEmpirePrivilege(EmpireEnum.RED, PrivilegeTypeEnum.GOLD, 10, -200)).to.throw(
            'Invalid privilege parameters',
        );
    });

    it('should remove expired privileges and keep others intact', () => {
        const player = { getId: () => 1 } as unknown as Player;
        const anotherPlayer = { getId: () => 2 } as unknown as Player;

        privilegeManager.addPlayerPrivilege(player, PrivilegeTypeEnum.EXP, 5, 50);
        privilegeManager.addPlayerPrivilege(anotherPlayer, PrivilegeTypeEnum.EXP, 15, 150);

        clock.tick(5000);
        privilegeManager.tick();

        const expiredPrivilege = privilegeManager.getPlayerPrivilege(player, PrivilegeTypeEnum.EXP);
        const activePrivilege = privilegeManager.getPlayerPrivilege(anotherPlayer, PrivilegeTypeEnum.EXP);

        expect(expiredPrivilege).to.be.undefined;
        expect(activePrivilege).to.equal(150);
    });
});
