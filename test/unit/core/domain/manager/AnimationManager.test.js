import { expect } from 'chai';
import sinon from 'sinon';
import AnimationManager from '../../../../../src/core/domain/manager/AnimationManager.js';
import Animation from '../../../../../src/core/domain/Animation.js';

describe('AnimationManager Integration Tests', function () {
    let animationManager;
    let loggerMock;
    let configMock;

    beforeEach(function () {
        loggerMock = {
            info: sinon.spy(),
        };

        configMock = {
            animations: [
                { key: 'job1:type1:sub1', MotionDuration: 500, Accumulation: [1, 2, 3] },
                { key: 'job2:type2:sub2', MotionDuration: 700, Accumulation: [0, 0, 0] },
            ],
        };

        animationManager = new AnimationManager({ logger: loggerMock, config: configMock });
    });

    it('should load animations correctly', async function () {
        await animationManager.load();

        expect(animationManager.animations.size).to.equal(2);

        const animation1 = animationManager.getAnimation('job1', 'type1', 'sub1');
        expect(animation1).to.be.instanceOf(Animation);
        expect(animation1.duration).to.equal(500);
        expect(animation1.accX).to.equal(1);
        expect(animation1.accY).to.equal(2);
        expect(animation1.accZ).to.equal(3);

        const animation2 = animationManager.getAnimation('job2', 'type2', 'sub2');
        expect(animation2).to.be.instanceOf(Animation);
        expect(animation2.duration).to.equal(700);
        expect(animation2.accX).to.equal(0);
        expect(animation2.accY).to.equal(0);
        expect(animation2.accZ).to.equal(0);

        expect(loggerMock.info.calledOnce).to.be.true;
        expect(loggerMock.info.calledWith('[ANIMATION_MANAGER] Animations loaded with success, total: ', 2)).to.be.true;
    });

    it('should return the correct animation using getAnimation', async function () {
        await animationManager.load();

        const animation = animationManager.getAnimation('job1', 'type1', 'sub1');
        expect(animation).to.be.instanceOf(Animation);
        expect(animation.duration).to.equal(500);
    });

    it('should return undefined for a non-existing animation', async function () {
        await animationManager.load();

        const animation = animationManager.getAnimation('non-existing-job', 'type', 'sub');
        expect(animation).to.be.undefined;
    });

    it('should return the animations map', async function () {
        await animationManager.load();
        const animations = animationManager.animations;

        expect(animations).to.be.instanceOf(Map);
        expect(animations.size).to.equal(2);
    });
});
