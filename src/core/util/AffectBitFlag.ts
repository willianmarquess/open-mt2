import BitFlag from './BitFlag';

const AFF_BITS_MAX = 64;

export default class AffectBitFlag {
    private flags: [BitFlag, BitFlag];

    constructor(v1 = 0, v2 = 0) {
        this.flags = [new BitFlag(v1), new BitFlag(v2)];
    }

    isSet(flag: number): boolean {
        if (flag <= 0 || flag > AFF_BITS_MAX) return false;

        const index = Math.floor((flag - 1) / 32);
        const bit = 1 << (flag - 1) % 32;
        return this.flags[index].is(bit);
    }

    set(flag: number): void {
        if (flag <= 0 || flag > AFF_BITS_MAX) return;

        const index = Math.floor((flag - 1) / 32);
        const bit = 1 << (flag - 1) % 32;
        this.flags[index].set(bit);
    }

    reset(flag: number): void {
        if (flag <= 0 || flag > AFF_BITS_MAX) return;

        const index = Math.floor((flag - 1) / 32);
        const bit = 1 << (flag - 1) % 32;
        this.flags[index].remove(bit);
    }

    toggle(flag: number): void {
        if (flag <= 0 || flag > AFF_BITS_MAX) return;

        const index = Math.floor((flag - 1) / 32);
        const bit = 1 << (flag - 1) % 32;
        this.flags[index].toggle(bit);
    }

    getFlags(): [number, number] {
        return [this.flags[0].getFlag(), this.flags[1].getFlag()];
    }
}
