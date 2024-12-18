import { ApplyTypeEnum } from '@/core/enum/ApplyTypeEnum';

export default class ItemApply {
    public type: ApplyTypeEnum;
    public value: number;

    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
}
