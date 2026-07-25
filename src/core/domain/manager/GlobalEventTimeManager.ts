type EventCallback = (count: number) => void;

type TimerOptions = {
    interval: number;
    duration?: number;
    repeatCount?: number;
};

export type addTimerParam = {
    ownerId: number;
    id: string;
    eventFunction: EventCallback;
    options: TimerOptions;
    onEndEventFunction?: EventCallback;
};

interface TimerEntry {
    ownerId: number;
    id: string;
    eventFunction: EventCallback;
    onEndEventFunction?: EventCallback;
    interval: number;
    repeatCount?: number;
    endTime?: number;
    nextExecutionTime: number;
    executedCount: number;
}

export default class GlobalEventTimerManager {
    private timers: Map<string, TimerEntry> = new Map();
    private ownerTimers: Map<number, Set<string>> = new Map();

    constructor() {}

    private getCompositeKey(ownerId: number, id: string): string {
        return `${ownerId}:${id}`;
    }

    public tick(): void {
        const now = Date.now();

        for (const [compositeKey, timer] of this.timers) {
            if (now >= timer.nextExecutionTime) {
                timer.executedCount++;
                timer.eventFunction(timer.executedCount);

                const shouldEnd =
                    (timer.endTime && now >= timer.endTime) ||
                    (timer.repeatCount && timer.executedCount >= timer.repeatCount);

                if (shouldEnd) {
                    this.removeTimerInternal(compositeKey, timer.ownerId);
                    if (timer.onEndEventFunction) {
                        timer.onEndEventFunction(timer.executedCount);
                    }
                } else {
                    timer.nextExecutionTime += timer.interval;
                }
            }
        }
    }

    private removeTimerInternal(compositeKey: string, ownerId: number): void {
        this.timers.delete(compositeKey);

        const ownerSet = this.ownerTimers.get(ownerId);
        if (ownerSet) {
            ownerSet.delete(compositeKey);
            if (ownerSet.size === 0) {
                this.ownerTimers.delete(ownerId);
            }
        }
    }

    addTimer(params: addTimerParam): void {
        const { ownerId, id, options, eventFunction, onEndEventFunction } = params;
        const compositeKey = this.getCompositeKey(ownerId, id);

        if (this.timers.has(compositeKey)) {
            this.removeTimerInternal(compositeKey, ownerId);
        }

        const { interval, duration, repeatCount } = options;
        const now = Date.now();

        const timerEntry: TimerEntry = {
            ownerId,
            id,
            eventFunction,
            onEndEventFunction,
            interval,
            repeatCount,
            endTime: duration ? now + duration : undefined,
            nextExecutionTime: now + interval,
            executedCount: 0,
        };

        this.timers.set(compositeKey, timerEntry);

        if (!this.ownerTimers.has(ownerId)) {
            this.ownerTimers.set(ownerId, new Set());
        }
        this.ownerTimers.get(ownerId)!.add(compositeKey);
    }

    removeTimer(ownerId: number, id: string): void {
        const compositeKey = this.getCompositeKey(ownerId, id);
        const timer = this.timers.get(compositeKey);

        if (timer) {
            this.removeTimerInternal(compositeKey, ownerId);
        }
    }

    removeAllTimersFromOwner(ownerId: number): void {
        const ownerSet = this.ownerTimers.get(ownerId);
        if (!ownerSet) return;

        for (const compositeKey of ownerSet) {
            this.timers.delete(compositeKey);
        }
        this.ownerTimers.delete(ownerId);
    }

    isTimerActive(ownerId: number, id: string): boolean {
        return this.timers.has(this.getCompositeKey(ownerId, id));
    }

    hasAnyTimer(ownerId: number): boolean {
        const ownerSet = this.ownerTimers.get(ownerId);
        return ownerSet !== undefined && ownerSet.size > 0;
    }

    getActiveTimerCount(): number {
        return this.timers.size;
    }

    clearAllTimers(): void {
        this.timers.clear();
        this.ownerTimers.clear();
    }
}
