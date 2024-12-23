import Animation from '@/core/domain/Animation';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import { expect } from 'chai';
import sinon from 'sinon';

describe('AnimationManager', function () {
    let animationManager: AnimationManager;
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

        expect(animationManager.getAnimations().size).to.equal(2);

        const animation1 = animationManager.getAnimation('job1', 'type1', 'sub1');
        expect(animation1).to.be.instanceOf(Animation);
        expect(animation1.getDuration()).to.equal(500);
        expect(animation1.getAccX()).to.equal(1);
        expect(animation1.getAccY()).to.equal(2);
        expect(animation1.getAccZ()).to.equal(3);

        const animation2 = animationManager.getAnimation('job2', 'type2', 'sub2');
        expect(animation2).to.be.instanceOf(Animation);
        expect(animation2.getDuration()).to.equal(700);
        expect(animation2.getAccX()).to.equal(0);
        expect(animation2.getAccY()).to.equal(0);
        expect(animation2.getAccZ()).to.equal(0);

        expect(loggerMock.info.calledOnce).to.be.true;
        expect(loggerMock.info.calledWith('[ANIMATION_MANAGER] Animations loaded with success, total: ', 2)).to.be.true;
    });

    it('should return the correct animation using getAnimation', async function () {
        await animationManager.load();

        const animation = animationManager.getAnimation('job1', 'type1', 'sub1');
        expect(animation).to.be.instanceOf(Animation);
        expect(animation.getDuration()).to.equal(500);
    });

    it('should return undefined for a non-existing animation', async function () {
        await animationManager.load();

        const animation = animationManager.getAnimation('non-existing-job', 'type', 'sub');
        expect(animation).to.be.undefined;
    });

    it('should return the animations map', async function () {
        await animationManager.load();
        const animations = animationManager.getAnimations();

        expect(animations).to.be.instanceOf(Map);
        expect(animations.size).to.equal(2);
    });
});
