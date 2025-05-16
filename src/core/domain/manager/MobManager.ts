// const ImmuneFlagsEnum = {
//     STUN: 1 << 0,
//     SLOW: 1 << 1,
//     FALL: 1 << 2,
//     CURSE: 1 << 3,
//     POISON: 1 << 4,
//     TERROR: 1 << 5,
//     REFLECT: 1 << 6,
// };

import { GameConfig, MobsProto } from '@/game/infra/config/GameConfig';
import Monster from '../entities/game/mob/Monster';
import NPC from '../entities/game/mob/NPC';
import Stone from '../entities/game/mob/Stone';
import AnimationManager from './AnimationManager';
import DropManager from './DropManager';
import ExperienceManager from './ExperienceManager';
import Logger from '@/core/infra/logger/Logger';

// const MobRankEnum = {
//     PAWN: 0,
//     S_PAWN: 1,
//     KNIGHT: 2,
//     S_KNIGHT: 3,
//     BOSS: 4,
//     KING: 5,
// };

// const MobAiFlagEnum = {
//     AGGRESSIVE: 1 << 0,
//     NOMOVE: 1 << 1,
//     COWARD: 1 << 2,
//     NOATTACKSHINSU: 1 << 3,
//     NOATTACKJINNO: 1 << 4,
//     NOATTACKCHUNJO: 1 << 5,
//     ATTACKMOB: 1 << 6,
//     BERSERK: 1 << 7,
//     STONESKIN: 1 << 8,
//     GODSPEED: 1 << 9,
//     DEATHBLOW: 1 << 10,
//     REVIVE: 1 << 11,
// };

// const MobEnchantsEnum = {
//     CURSE: 0,
//     SLOW: 1,
//     POISON: 2,
//     STUN: 3,
//     CRITICAL: 4,
//     PENETRATE: 5,
// };

// const MobResistsEnum = {
//     SWORD: 0,
//     TWOHAND: 1,
//     DAGGER: 2,
//     BELL: 3,
//     FAN: 4,
//     BOW: 5,
//     FIRE: 6,
//     ELECT: 7,
//     MAGIC: 8,
//     WIND: 9,
//     POISON: 10,
// };

// const MobBattleTypeEnum = {
//     POWER: 0,
//     TANKER: 1,
//     SUPER_POWER: 2,
//     SUPER_TANKER: 3,
//     RANGE: 4,
//     MAGIC: 5,
// };

// const RaceFlagsEnum = {
//     ANIMAL: 1 << 0,
//     UNDEAD: 1 << 1,
//     DEVIL: 1 << 2,
//     HUMAN: 1 << 3,
//     ORC: 1 << 4,
//     MILGYO: 1 << 5,
//     INSECT: 1 << 6,
//     FIRE: 1 << 7,
//     ICE: 1 << 8,
//     DESERT: 1 << 9,
//     TREE: 1 << 10,
//     ATT_ELEC: 1 << 11,
//     ATT_FIRE: 1 << 12,
//     ATT_ICE: 1 << 13,
//     ATT_WIND: 1 << 14,
//     ATT_EARTH: 1 << 15,
//     ATT_DARK: 1 << 16,
// };

export default class MobManager {
    private readonly config: GameConfig;
    private readonly mobs = new Map<number, MobsProto>(); //todo
    private readonly animationManager: AnimationManager;
    private readonly dropManager: DropManager;
    private readonly experienceManager: ExperienceManager;
    private readonly logger: Logger;

    constructor({ config, animationManager, dropManager, experienceManager, logger }) {
        this.config = config;
        this.animationManager = animationManager;
        this.dropManager = dropManager;
        this.experienceManager = experienceManager;
        this.logger = logger;
    }

    load() {
        this.config.mobs.forEach((mob) => {
            this.mobs.set(Number(mob.vnum), mob);
        });
    }

    hasMob(id: number) {
        return this.mobs.has(id);
    }

    getMob(id: number, positionX: number, positionY: number, direction: number = 0) {
        const proto = this.mobs.get(id);
        if (!proto) return;

        switch (proto.type) {
            case 'MONSTER': {
                return new Monster(
                    {
                        direction,
                        positionX,
                        positionY,
                        proto,
                    },
                    {
                        animationManager: this.animationManager,
                        dropManager: this.dropManager,
                        experienceManager: this.experienceManager,
                        logger: this.logger,
                    },
                );
            }
            case 'NPC': {
                return new NPC(
                    {
                        direction,
                        positionX,
                        positionY,
                        proto,
                    },
                    {
                        animationManager: this.animationManager,
                        logger: this.logger,
                    },
                );
            }
            case 'STONE': {
                return new Stone(
                    {
                        direction,
                        positionX,
                        positionY,
                        proto,
                    },
                    {
                        animationManager: this.animationManager,
                        logger: this.logger,
                    },
                );
            }
        }
    }
}
