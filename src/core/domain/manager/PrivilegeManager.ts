import { EmpireEnum } from '@/core/enum/EmpireEnum';
import Player from '../entities/game/player/Player';

export enum PrivilegeTypeEnum {
    EXP,
    GOLD,
    GOLD_5,
    GOLD_10,
    GOLD_50,
    DROP,
}

type Privilege<T> = {
    type: PrivilegeTypeEnum;
    target: T;
    expirationTimestamp: number;
    expirationDate: string;
    value: number;
};

//TODO: storing this in the database in the future we will probably need to refactor

export class PrivilegeManager {
    private readonly playerPrivilege: Map<PrivilegeTypeEnum, Array<Privilege<Player>>> = new Map();
    private readonly empirePrivilege: Map<PrivilegeTypeEnum, Array<Privilege<EmpireEnum>>> = new Map();

    addEmpirePrivilege(target: EmpireEnum, type: PrivilegeTypeEnum, timeToExpirationInSeconds: number, value: number) {
        if (timeToExpirationInSeconds <= 0 || value <= 0) {
            throw new Error('Invalid privilege parameters');
        }

        const timeToExpirationInMilliSeconds = timeToExpirationInSeconds * 1000;
        const dataExpiracao = new Date(new Date().getTime() + timeToExpirationInMilliSeconds);

        const privilege: Privilege<EmpireEnum> = {
            type,
            target,
            expirationTimestamp: performance.now() + timeToExpirationInMilliSeconds,
            expirationDate: dataExpiracao.toISOString(),
            value,
        };

        if (!this.empirePrivilege.has(type)) {
            this.empirePrivilege.set(type, []);
        }

        const privileges = this.empirePrivilege.get(type)!;

        const index = privileges.findIndex((p) => p.expirationTimestamp > privilege.expirationTimestamp);
        if (index === -1) {
            privileges.push(privilege);
        } else {
            privileges.splice(index, 0, privilege);
        }
    }

    addPlayerPrivilege(target: Player, type: PrivilegeTypeEnum, timeToExpirationInSeconds: number, value: number) {
        if (timeToExpirationInSeconds <= 0 || value <= 0) {
            throw new Error('Invalid privilege parameters');
        }

        const timeToExpirationInMilliSeconds = timeToExpirationInSeconds * 1000;
        const dataExpiracao = new Date(new Date().getTime() + timeToExpirationInMilliSeconds);

        const privilege: Privilege<Player> = {
            type,
            target,
            expirationTimestamp: performance.now() + timeToExpirationInMilliSeconds,
            expirationDate: dataExpiracao.toISOString(),
            value,
        };

        if (!this.playerPrivilege.has(type)) {
            this.playerPrivilege.set(type, []);
        }

        const privileges = this.playerPrivilege.get(type)!;

        const index = privileges.findIndex((p) => p.expirationTimestamp > privilege.expirationTimestamp);
        if (index === -1) {
            privileges.push(privilege);
        } else {
            privileges.splice(index, 0, privilege);
        }
    }

    tick() {
        const now = performance.now();

        for (const [type, privilegeArray] of this.playerPrivilege.entries()) {
            while (privilegeArray.length > 0 && privilegeArray[0].expirationTimestamp <= now) {
                privilegeArray.shift();
            }

            if (privilegeArray.length === 0) {
                this.playerPrivilege.delete(type);
            }
        }

        for (const [type, privilegeArray] of this.empirePrivilege.entries()) {
            while (privilegeArray.length > 0 && privilegeArray[0].expirationTimestamp <= now) {
                privilegeArray.shift();
            }

            if (privilegeArray.length === 0) {
                this.empirePrivilege.delete(type);
            }
        }
    }

    getPlayerPrivilege(target: Player, type: PrivilegeTypeEnum): number {
        const privileges = this.playerPrivilege.get(type);
        if (!privileges) return 0;

        const privilege = privileges.find((privilege) => privilege.target.getId() === target.getId());
        return privilege?.value;
    }

    getEmpirePrivilege(target: EmpireEnum, type: PrivilegeTypeEnum): number {
        const privileges = this.empirePrivilege.get(type);
        if (!privileges) return 0;

        const privilege = privileges.find((privilege) => privilege.target === target);
        return privilege?.value;
    }

    getEmpiresPrivileges() {
        return {
            [PrivilegeTypeEnum.EXP]: this.empirePrivilege.get(PrivilegeTypeEnum.EXP) || [],
            [PrivilegeTypeEnum.GOLD]: this.empirePrivilege.get(PrivilegeTypeEnum.GOLD) || [],
            [PrivilegeTypeEnum.DROP]: this.empirePrivilege.get(PrivilegeTypeEnum.DROP) || [],
            [PrivilegeTypeEnum.GOLD_5]: this.empirePrivilege.get(PrivilegeTypeEnum.GOLD_5) || [],
            [PrivilegeTypeEnum.GOLD_10]: this.empirePrivilege.get(PrivilegeTypeEnum.GOLD_10) || [],
            [PrivilegeTypeEnum.GOLD_50]: this.empirePrivilege.get(PrivilegeTypeEnum.GOLD_50) || [],
        };
    }
}
