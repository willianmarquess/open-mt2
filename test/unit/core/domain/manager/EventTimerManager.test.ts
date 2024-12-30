import EventTimerManager from '@/core/domain/manager/EventTimerManager';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';

describe('EventTimerManager', () => {
    let timerManager: EventTimerManager;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        timerManager = new EventTimerManager();
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should execute onEndEventFunction when the timer ends due to duration', () => {
        const eventFunction = sinon.spy();
        const onEndEventFunction = sinon.spy();

        timerManager.addTimer({
            id: 'testTimer',
            eventFunction,
            options: { interval: 100, duration: 300 },
            onEndEventFunction,
        });

        clock.tick(300);

        expect(eventFunction.callCount).to.equal(3);
        expect(onEndEventFunction.calledOnce).to.be.true;
    });

    it('should execute onEndEventFunction when the timer ends due to repeatCount', () => {
        const eventFunction = sinon.spy();
        const onEndEventFunction = sinon.spy();

        timerManager.addTimer({
            id: 'repeatTimer',
            eventFunction,
            options: { interval: 100, repeatCount: 3 },
            onEndEventFunction,
        });

        clock.tick(300);

        expect(eventFunction.callCount).to.equal(3);
        expect(onEndEventFunction.calledOnce).to.be.true;
    });

    it('should not execute onEndEventFunction if the timer is removed early', () => {
        const eventFunction = sinon.spy();
        const onEndEventFunction = sinon.spy();

        timerManager.addTimer({
            id: 'earlyRemoveTimer',
            eventFunction,
            options: { interval: 100, repeatCount: 5 },
            onEndEventFunction,
        });

        clock.tick(200);
        timerManager.removeTimer('earlyRemoveTimer');
        clock.tick(300);

        expect(eventFunction.callCount).to.equal(2);
        expect(onEndEventFunction.notCalled).to.be.true;
    });

    it('should handle multiple timers and execute their onEndEventFunction independently', () => {
        const eventFunction1 = sinon.spy();
        const onEndEventFunction1 = sinon.spy();

        const eventFunction2 = sinon.spy();
        const onEndEventFunction2 = sinon.spy();

        timerManager.addTimer({
            id: 'timer1',
            eventFunction: eventFunction1,
            options: { interval: 100, duration: 300 },
            onEndEventFunction: onEndEventFunction1,
        });

        timerManager.addTimer({
            id: 'timer2',
            eventFunction: eventFunction2,
            options: { interval: 200, repeatCount: 2 },
            onEndEventFunction: onEndEventFunction2,
        });

        clock.tick(400);

        expect(eventFunction1.callCount).to.equal(3);
        expect(onEndEventFunction1.calledOnce).to.be.true;

        expect(eventFunction2.callCount).to.equal(2);
        expect(onEndEventFunction2.calledOnce).to.be.true;
    });

    it('should not throw errors when no onEndEventFunction is provided', () => {
        const eventFunction = sinon.spy();

        timerManager.addTimer({
            id: 'noEndCallbackTimer',
            eventFunction,
            options: { interval: 100, repeatCount: 3 },
        });

        clock.tick(300);

        expect(eventFunction.callCount).to.equal(3);
    });
});
