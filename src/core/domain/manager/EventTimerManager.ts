type EventCallback = () => void;

type TimerOptions = {
    interval: number;
    duration?: number;
    repeatCount?: number;
}

export default class EventTimerManager {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private endTimes: Map<string, number> = new Map();

    addTimer(id: string, callback: EventCallback, options: TimerOptions): void {
        if (this.timers.has(id)) {
            throw new Error(`Timer with ID "${id}" already exists.`);
        }

        const { interval, duration, repeatCount } = options;
        const startTime = Date.now();
        const endTime = duration ? startTime + duration : undefined;
        let executedCount = 0;

        const timer = setInterval(() => {
            const now = Date.now();

            callback();

            executedCount++;

            if ((endTime && now >= endTime) || (repeatCount && executedCount >= repeatCount)) {
                this.removeTimer(id);
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
            this.removeTimer(id)
        }
    }
}