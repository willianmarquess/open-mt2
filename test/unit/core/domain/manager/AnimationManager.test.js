import { expect } from 'chai';
import sinon from 'sinon';
import fsPromise from 'fs/promises';
import fs from 'fs';
import AnimationManager from '../../../../../src/core/domain/manager/AnimationManager.js';
import JobEnum from '../../../../../src/core/enum/JobEnum.js';
import AnimationTypeEnum from '../../../../../src/core/enum/AnimationTypeEnum.js';
import AnimationSubTypeEnum from '../../../../../src/core/enum/AnimationSubTypeEnum.js';
import Animation from '../../../../../src/core/domain/Animation.js';

describe('AnimationManager', () => {
    let logger;
    let animationManager;
    let readFileStub;
    let existsFileSyncStub;

    beforeEach(() => {
        logger = { info: sinon.stub(), error: sinon.stub() };
        animationManager = new AnimationManager({ logger, config: { mobs: [] } });
        readFileStub = sinon.stub(fsPromise, 'readFile');
        existsFileSyncStub = sinon.stub(fs, 'existsSync');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize animations object', () => {
        expect(animationManager.animations).to.be.an('object');
    });

    it('should load animations correctly', async () => {
        const animationData = JSON.stringify({
            MotionDuration: 100,
            Accumulation: [1, 2, 3],
        });

        readFileStub.resolves(animationData);
        existsFileSyncStub.resolves(true);

        await animationManager.load();

        for (const job of Object.values(JobEnum)) {
            for (const type of Object.values(AnimationTypeEnum)) {
                for (const sub of Object.values(AnimationSubTypeEnum)) {
                    const animation = animationManager.getAnimation(job, type, sub);
                    expect(animation).to.be.instanceOf(Animation);
                    expect(animation.duration).to.equal(100);
                    expect(animation.accX).to.equal(1);
                    expect(animation.accY).to.equal(2);
                    expect(animation.accZ).to.equal(3);
                }
            }
        }
    });

    it('should handle error when loading animation data', async () => {
        readFileStub.rejects(new Error('File not found'));

        await animationManager.load();

        for (const job of Object.values(JobEnum)) {
            for (const type of Object.values(AnimationTypeEnum)) {
                for (const sub of Object.values(AnimationSubTypeEnum)) {
                    const animation = animationManager.getAnimation(job, type, sub);
                    expect(animation).to.be.undefined;
                }
            }
        }
    });
});
