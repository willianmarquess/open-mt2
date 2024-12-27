import { EmpireEnum } from '@/core/enum/EmpireEnum';

const empireIdToEmpireName = {
    [EmpireEnum.RED]: 'red',
    [EmpireEnum.YELLOW]: 'yellow',
    [EmpireEnum.BLUE]: 'blue',
};

export default class EmpireUtil {
    static getEmpireName(empireId: EmpireEnum) {
        return empireIdToEmpireName[empireId] || empireIdToEmpireName[EmpireEnum.BLUE];
    }
}
