import { PointsEnum } from '@/core/enum/PointsEnum';

type PointConfig = {
    add?: (value: number) => void;
    get: () => number;
    set?: (value: number) => void;
    beforeAddHooks?: () => Array<VoidFunction>;
    afterAddHooks?: () => Array<VoidFunction>;
};

export abstract class Points {
    protected points: Map<PointsEnum, PointConfig> = new Map();

    setPoint(pointType: PointsEnum, value: number): void {
        const point = this.points.get(pointType);

        if (!point) return;

        if (point.set && typeof point.set === 'function') {
            point.set(value);
        }
    }

    addPoint(pointType: PointsEnum, value: number) {
        const point = this.points.get(pointType);

        if (!point) return;

        if (point.add && typeof point.add === 'function') {
            if (point.beforeAddHooks && typeof point.beforeAddHooks === 'function') {
                const beforeAddHooks = point.beforeAddHooks();
                for (const beforeAddHook of beforeAddHooks) {
                    beforeAddHook.bind(this);
                }
            }

            point.add(value);

            if (point.afterAddHooks && typeof point.afterAddHooks === 'function') {
                const afterAddHooks = point.afterAddHooks();
                for (const afterAddHook of afterAddHooks) {
                    afterAddHook.bind(this)();
                }
            }
        }
    }

    getPoint(pointType: PointsEnum): number {
        if (!this.points.has(pointType)) return 0;

        const point = this.points.get(pointType);

        return point.get() ?? 0;
    }

    abstract calcPointsAndResetValues(): void;
    abstract calcPoints(): void;

    getPoints(): Map<PointsEnum, PointConfig> {
        return this.points;
    }
}
