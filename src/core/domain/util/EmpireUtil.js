const empire = {
    RED: 1,
    YELLOW: 2,
    BLUE: 3,
};

const empireIdToEmpireName = {
    [empire.RED]: 'red',
    [empire.YELLOW]: 'yellow',
    [empire.BLUE]: 'blue',
};

export default class EmpireUtil {
    static getEmpireName(empireId) {
        return empireIdToEmpireName[empireId] || empireIdToEmpireName[empire.BLUE];
    }
}
