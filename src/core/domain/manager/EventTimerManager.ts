type EventCallback = (count: number) => void | Promise<void>;

type TimerOptions = {
    interval: number;
    duration?: number;
    repeatCount?: number;
};

export type addTimerParam = {
    id: string;
    eventFunction: EventCallback;
    options: TimerOptions;
    onEndEventFunction?: EventCallback;
};

export default class EventTimerManager {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private endTimes: Map<string, number> = new Map();

    addTimer(params: addTimerParam): void {
        const { id, options, eventFunction, onEndEventFunction } = params;

        if (this.timers.has(id)) {
            this.removeTimer(id);
        }

        const { interval, duration, repeatCount } = options;
        const startTime = Date.now();
        const endTime = duration ? startTime + duration : undefined;
        let executedCount = 0;

        const timer = setInterval(async () => {
            const now = Date.now();

            executedCount++;
            await eventFunction(executedCount);

            if ((endTime && now >= endTime) || (repeatCount && executedCount >= repeatCount)) {
                this.removeTimer(id);
                if (onEndEventFunction) {
                    await onEndEventFunction(executedCount);
                }
            }
        }, interval);

        this.timers.set(id, timer);

        if (endTime) {
            this.endTimes.set(id, endTime);
        }
    }

    removeTimer(id: string): void {
        const timer = this.timers.get(id);

        if (timer) {
            clearInterval(timer);
            this.timers.delete(id);
            this.endTimes.delete(id);
        }
    }

    isTimerActive(id: string): boolean {
        return this.timers.has(id);
    }

    clearAllTimers(): void {
        for (const id of this.timers.keys()) {
            this.removeTimer(id);
        }
    }
}
