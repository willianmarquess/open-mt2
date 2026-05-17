import { EmpireEnum } from '@/core/enum/EmpireEnum';

export type EmpireName = 'red' | 'yellow' | 'blue' | 'neutral';

const empireIdToEmpireName: Record<EmpireEnum, EmpireName> = {
    [EmpireEnum.NEUTRAL]: 'neutral',
    [EmpireEnum.RED]: 'red',
    [EmpireEnum.YELLOW]: 'yellow',
    [EmpireEnum.BLUE]: 'blue',
};

export default class EmpireUtil {
    static getEmpireName(empireId: EmpireEnum): EmpireName {
        return empireIdToEmpireName[empireId] || empireIdToEmpireName[EmpireEnum.BLUE];
    }
}
