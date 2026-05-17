import { ItemLimitTypeEnum } from '@/core/enum/ItemLimitTypeEnum';

export default class ItemLimit {
    public type: ItemLimitTypeEnum;
    public value: number;

    constructor({ type, value }: { type: ItemLimitTypeEnum; value: number }) {
        this.type = type;
        this.value = value;
    }
}
