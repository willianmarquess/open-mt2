export default class FlyEffectCreatedEvent {
    public readonly type: number;
    public readonly fromVirtualId: number;
    public readonly toVirtualId: number;

    constructor({ type, fromVirtualId, toVirtualId }: { type: number; fromVirtualId: number; toVirtualId: number }) {
        this.type = type;
        this.fromVirtualId = fromVirtualId;
        this.toVirtualId = toVirtualId;
    }
}
