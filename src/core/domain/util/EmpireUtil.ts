enum EmpireEnum {
    RED = 1,
    YELLOW = 2,
    BLUE = 3,
};

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
