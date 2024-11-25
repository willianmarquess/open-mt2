import Animation from '../Animation.js';
import AnimationUtil from '../util/AnimationUtil.js';

export default class AnimationManager {
    #animations = new Map();
    #logger;
    #config;

    constructor({ logger, config }) {
        this.#logger = logger;
        this.#config = config;
    }

    get animations() {
        return this.#animations;
    }

    getAnimation(job, type, sub) {
        return this.#animations.get(AnimationUtil.createAnimationKey(job, type, sub));
    }

    async load() {
        for (const animationData of this.#config.animations) {
            const { MotionDuration: duration, Accumulation = [] } = animationData;
            const [accX = 0, accY = 0, accZ = 0] = Accumulation;
            const animation = new Animation({
                duration,
                accX,
                accY,
                accZ,
            });
            this.#animations.set(animationData.key, animation);
        }

        this.#logger.info('[ANIMATION_MANAGER] Animations loaded with success, total: ', this.#animations.size);
    }
}
