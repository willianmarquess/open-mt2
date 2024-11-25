import fsPromise from 'fs/promises';
import fs from 'fs';
import path from 'path';
import JobEnum from '../../src/core/enum/JobEnum.js';
import AnimationTypeEnum from '../../src/core/enum/AnimationTypeEnum.js';
import AnimationSubTypeEnum from '../../src/core/enum/AnimationSubTypeEnum.js';
import JobUtil from '../../src/core/domain/util/JobUtil.js';
import mobs from '../../src/core/infra/config/data/mobs.json' with { type: 'json' };
import AnimationUtil from '../../src/core/domain/util/AnimationUtil.js';

const DEFAULT_ANIMATIONS_PATH = './tools/animation';

/**
 * This file we use to create a single file with all Game animations, to avoid to read many file when server initiate,
 * if we need to add a new animation we can edit de animations.json file following the same structure.
 */

class AnimationGenerator {

    #animations = [];

    async init() {
        for (const mob of mobs) {
            if (!mob || !mob.folder) continue;
            for (const type of Object.values(AnimationTypeEnum)) {
                const path = DEFAULT_ANIMATIONS_PATH + `/monster/${mob.folder}/${type}.json`;

                const animationData = await this.#loadAnimationData(path);
                if (!animationData) continue;

                this.#animations.push({
                    key: AnimationUtil.createAnimationKey(mob.vnum, type, AnimationSubTypeEnum.GENERAL),
                    ...animationData
                });
            }
        }

        for (const job of Object.values(JobEnum)) {
            for (const type of Object.values(AnimationTypeEnum)) {
                for (const sub of Object.values(AnimationSubTypeEnum)) {
                    const genderFolder = job < 4 ? 'pc' : 'pc2';
                    const classFolder = JobUtil.getClassNameFromClassId(job);
                    const subTypeFolder = sub;
                    const typeFile = `${type}.json`;
                    console.log(
                        `[ANIMATION_MANAGER] Loading animation: /${genderFolder}/${classFolder}/${subTypeFolder}/${typeFile}`,
                    );
                    const path =
                        DEFAULT_ANIMATIONS_PATH + `/${genderFolder}/${classFolder}/${subTypeFolder}/${typeFile}`;

                    const animationData = await this.#loadAnimationData(path);
                    if (!animationData) continue;

                    this.#animations.push({
                        key: AnimationUtil.createAnimationKey(job, type, sub),
                        ...animationData
                    });
                }
            }
        }

        await fsPromise.writeFile(DEFAULT_ANIMATIONS_PATH + '/animations.json', JSON.stringify(this.#animations), 'utf8');
    }

    async #loadAnimationData(filePath) {
        const currentDir = process.cwd();
        const absoluteFilePath = path.join(currentDir, filePath);
        try {
            if (!fs.existsSync(absoluteFilePath)) return;
            const fileContent = await fsPromise.readFile(absoluteFilePath, 'utf8');
            const animationData = JSON.parse(fileContent || '');

            return animationData;
        } catch (error) {
            console.error(`Error loading animation data from ${filePath}:${error.message}`);
        }
    }
}

new AnimationGenerator().init();
