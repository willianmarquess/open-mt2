export default class AnimationUtil {
    static calcAnimationDuration(animation, movementSpeed, distance) {
        const animationSpeed = -animation.accY / animation.duration;
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

    static createAnimationKey(job, type, sub) {
        return `${job}:${type}:${sub}`;
    }
}
