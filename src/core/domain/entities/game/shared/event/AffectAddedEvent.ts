export default class AffectAddedEvent {
    public readonly type: number;
    public readonly apply: number;
    public readonly value: number;
    public readonly flag: number;
    public readonly duration: number;
    public readonly manaCost: number;

    constructor({
        type,
        apply,
        value,
        flag,
        duration,
        manaCost,
    }: {
        type: number;
        apply: number;
        value: number;
        flag: number;
        duration: number;
        manaCost: number;
    }) {
        this.type = type;
        this.apply = apply;
        this.value = value;
        this.flag = flag;
        this.duration = duration;
        this.manaCost = manaCost;
    }
}
