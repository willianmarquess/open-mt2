import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import AnimationSubTypeEnum from '../../enum/AnimationSubTypeEnum.js';
import AnimationTypeEnum from '../../enum/AnimationTypeEnum.js';
import JobEnum from '../../enum/JobEnum.js';
import JobUtil from '../util/JobUtil.js';
import Animation from '../Animation.js';

const DEFAULT_ANIMATIONS_PATH = 'src/core/infra/config/data/animation';

export default class AnimationManager {
    #animations = {};
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
        return this.#animations?.[job]?.[type]?.[sub];
    }

    async load() {
        for (const mob of this.#config.mobs) {
            if (!mob) continue;
            for (const type of Object.values(AnimationTypeEnum)) {
                const path = DEFAULT_ANIMATIONS_PATH + `/monster/${mob.folder}/${type}.json`;

                const animationData = await this.#loadAnimationData(path);
                if (!animationData) continue;

                this.#animations[mob.vnum] = this.#animations[mob.vnum] || {};
                this.#animations[mob.vnum][type] = this.#animations[mob.vnum][type] || {};
                this.#animations[mob.vnum][type][AnimationSubTypeEnum.GENERAL] = animationData;
            }
        }

        for (const job of Object.values(JobEnum)) {
            for (const type of Object.values(AnimationTypeEnum)) {
                for (const sub of Object.values(AnimationSubTypeEnum)) {
                    const genderFolder = job < 4 ? 'pc' : 'pc2';
                    const classFolder = JobUtil.getClassNameFromClassId(job);
                    const subTypeFolder = sub;
                    const typeFile = `${type}.json`;
                    this.#logger.info(
                        `[ANIMATION_MANAGER] Loading animation: /${genderFolder}/${classFolder}/${subTypeFolder}/${typeFile}`,
                    );
                    const path =
                        DEFAULT_ANIMATIONS_PATH + `/${genderFolder}/${classFolder}/${subTypeFolder}/${typeFile}`;

                    const animationData = await this.#loadAnimationData(path);
                    if (!animationData) continue;

                    this.#animations[job] = this.#animations[job] || {};
                    this.#animations[job][type] = this.#animations[job][type] || {};
                    this.#animations[job][type][sub] = animationData;
                }
            }
        }
    }

    async #loadAnimationData(filePath) {
        const currentDir = process.cwd();
        const absoluteFilePath = path.join(currentDir, filePath);
        try {
            if (!existsSync(absoluteFilePath)) return;
            const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
            const animationData = JSON.parse(fileContent || '');
            const { MotionDuration: duration, Accumulation = [] } = animationData;
            const [accX = 0, accY = 0, accZ = 0] = Accumulation;

            return new Animation({
                duration,
                accX,
                accY,
                accZ,
            });
        } catch (error) {
            this.#logger.error(`Error loading animation data from ${filePath}:${error.message}`);
        }
    }
}
