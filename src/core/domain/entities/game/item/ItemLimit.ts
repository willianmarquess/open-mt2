import { ItemLimitTypeEnum } from "@/core/enum/ItemLimitTypeEnum";

export default class ItemLimit {
    public type: ItemLimitTypeEnum;
    public value: number;

    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
}
