import Animation from '@/core/domain/Animation';

export default class AnimationUtil {
    static calcAnimationDuration(animation: Animation, movementSpeed: number, distance: number) {
        const animationSpeed = -animation.getAccZ() / animation.getDuration();
        let i = 100 - movementSpeed;
        if (i > 0) {
            i = 100 + i;
        } else if (i < 0) {
            i = 10000 / (100 - i);
        } else {
            i = 100;
        }

        return ((distance / animationSpeed) * 1000 * i) / 100;
    }

    static createAnimationKey(job: string, type: string, sub: string) {
        return `${job}:${type}:${sub}`;
    }
}
