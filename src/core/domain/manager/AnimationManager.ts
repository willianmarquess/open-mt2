import Logger from '@/core/infra/logger/Logger';
import Animation from '@/core/domain/Animation';
import AnimationUtil from '@/core/domain/util/AnimationUtil';
import { GameConfig } from '@/game/infra/config/GameConfig';

export default class AnimationManager {
    private readonly animations: Map<string, Animation> = new Map<string, Animation>();
    private readonly logger: Logger;
    private readonly config: GameConfig;

    constructor({ logger, config }) {
        this.logger = logger;
        this.config = config;
    }

    getAnimations() {
        return this.animations;
    }

    getAnimation(job: string, type: string, sub: string) {
        return this.animations.get(AnimationUtil.createAnimationKey(job, type, sub));
    }

    async load() {
        for (const animationData of this.config.animations) {
            const { MotionDuration: duration, Accumulation = [] } = animationData;
            const [accX = 0, accY = 0, accZ = 0] = Accumulation;
            const animation = new Animation({
                duration,
                accX,
                accY,
                accZ,
            });
            this.animations.set(animationData.key, animation);
        }

        this.logger.info('[ANIMATION_MANAGER] Animations loaded with success, total: ', this.animations.size);
    }
}
