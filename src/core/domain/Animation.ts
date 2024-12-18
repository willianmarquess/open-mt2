export default class Animation {
    private duration: number;
    private accX: number;
    private accY: number;
    private accZ: number;

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
