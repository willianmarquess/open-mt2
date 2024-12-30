import EventTimerManager from "@/core/domain/manager/EventTimerManager";
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";

describe("EventTimerManager with Sinon", () => {
    let timerManager: EventTimerManager;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        timerManager = new EventTimerManager();
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it("should add and execute a timer correctly", () => {
        const callback = sinon.spy();

        timerManager.addTimer("testTimer", callback, { interval: 100, repeatCount: 1 });

        clock.tick(100);

        expect(callback.calledOnce).to.be.true;
    });

    it("should throw an error when adding a timer with a duplicate ID", () => {
        const callback = () => {};

        timerManager.addTimer("duplicateTimer", callback, { interval: 100 });

        expect(() => {
            timerManager.addTimer("duplicateTimer", callback, { interval: 100 });
        }).to.throw(Error, `Timer with ID "duplicateTimer" already exists.`);
    });

    it("should remove a timer correctly", () => {
        const callback = sinon.spy();

        timerManager.addTimer("removableTimer", callback, { interval: 100, repeatCount: 1 });

        timerManager.removeTimer("removableTimer");

        clock.tick(100);

        expect(callback.notCalled).to.be.true;
        expect(timerManager.isTimerActive("removableTimer")).to.be.false;
    });

    it("should check if a timer is active", () => {
        const callback = () => {};
        timerManager.addTimer("activeTimer", callback, { interval: 100 });

        expect(timerManager.isTimerActive("activeTimer")).to.be.true;

        timerManager.removeTimer("activeTimer");

        expect(timerManager.isTimerActive("activeTimer")).to.be.false;
    });

    it("should clear all timers", () => {
        const callback = sinon.spy();

        timerManager.addTimer("timer1", callback, { interval: 100 });
        timerManager.addTimer("timer2", callback, { interval: 100 });

        timerManager.clearAllTimers();

        clock.tick(100);

        expect(callback.notCalled).to.be.true;
        expect(timerManager.isTimerActive("timer1")).to.be.false;
        expect(timerManager.isTimerActive("timer2")).to.be.false;
    });

    it("should execute a timer with a limited duration", () => {
        const callback = sinon.spy();

        timerManager.addTimer("limitedTimer", callback, { interval: 100, duration: 300 });

        clock.tick(100);
        clock.tick(100);
        clock.tick(100);
        clock.tick(100);

        expect(callback.callCount).to.equal(3);
        expect(timerManager.isTimerActive("limitedTimer")).to.be.false;
    });

    it("should execute a timer with a limited number of repetitions", () => {
        const callback = sinon.spy();

        timerManager.addTimer("repeatTimer", callback, { interval: 100, repeatCount: 3 });

        clock.tick(100);
        clock.tick(100);
        clock.tick(100);
        clock.tick(100);

        expect(callback.callCount).to.equal(3);
        expect(timerManager.isTimerActive("repeatTimer")).to.be.false;
    });
});
