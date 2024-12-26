import { expect } from 'chai';
import AnimationUtil from '@/core/domain/util/AnimationUtil';
import Animation from '@/core/domain/Animation';

describe('AnimationUtil', () => {
    it('should calculate animation duration', () => {
        const animation = new Animation({
            accY: -10,
            duration: 2,
            accX: 0,
            accZ: 0,
        });
        const movementSpeed = 50;
        const distance = 100;

        const duration = AnimationUtil.calcAnimationDuration(animation, movementSpeed, distance);

        expect(duration).to.be.a('number');
    });

    it('should create animation key', () => {
        const job = 'warrior';
        const type = 'attack';
        const sub = 'slash';

        const key = AnimationUtil.createAnimationKey(job, type, sub);

        expect(key).to.equal('warrior:attack:slash');
    });
});
