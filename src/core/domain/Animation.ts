export default class Animation {
    private readonly duration: number;
    private readonly accX: number;
    private readonly accY: number;
    private readonly accZ: number;

    constructor({ duration, accX, accY, accZ }) {
        this.duration = duration;
        this.accX = accX;
        this.accY = accY;
        this.accZ = accZ;
    }

    getDuration() {
        return this.duration;
    }
    getAccX() {
        return this.accX;
    }
    getAccY() {
        return this.accY;
    }
    getAccZ() {
        return this.accZ;
    }
}
