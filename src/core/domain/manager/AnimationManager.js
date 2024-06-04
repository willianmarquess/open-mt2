import fs from 'fs/promises';
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

    constructor({ logger }) {
        this.#logger = logger;
        this.load();
    }

    get animations() {
        return this.#animations;
    }

    getAnimation(job, type, sub) {
        return this.#animations[job][type][sub];
    }

    async load() {
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
                    this.#animations[job] = this.#animations[job] || {};
                    this.#animations[job][type] = this.#animations[job][type] || {};
                    this.#animations[job][type][sub] = await this.#loadAnimationData(path);
                }
            }
        }
    }

    async #loadAnimationData(filePath) {
        const currentDir = process.cwd();
        const absoluteFilePath = path.join(currentDir, filePath);
        try {
            const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
            const animationData = JSON.parse(fileContent);
            const { MotionDuration: duration, Accumulation = [] } = animationData;
            const [accX = 0, accY = 0, accZ = 0] = Accumulation;

            return new Animation({
                duration,
                accX,
                accY,
                accZ,
            });
        } catch (error) {
            console.error(`Error loading animation data from ${filePath}:`, error);
            return {};
        }
    }
}
