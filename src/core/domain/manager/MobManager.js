const ImmuneFlagsEnum = {
    STUN: 1 << 0,
    SLOW: 1 << 1,
    FALL: 1 << 2,
    CURSE: 1 << 3,
    POISON: 1 << 4,
    TERROR: 1 << 5,
    REFLECT: 1 << 6,
};

const MobRankEnum = {
    PAWN: 0,
    S_PAWN: 1,
    KNIGHT: 2,
    S_KNIGHT: 3,
    BOSS: 4,
    KING: 5,
};

const MobAiFlagEnum = {
    AGGRESSIVE: 1 << 0,
    NOMOVE: 1 << 1,
    COWARD: 1 << 2,
    NOATTACKSHINSU: 1 << 3,
    NOATTACKJINNO: 1 << 4,
    NOATTACKCHUNJO: 1 << 5,
    ATTACKMOB: 1 << 6,
    BERSERK: 1 << 7,
    STONESKIN: 1 << 8,
    GODSPEED: 1 << 9,
    DEATHBLOW: 1 << 10,
    REVIVE: 1 << 11,
};

const MobEnchantsEnum = {
    CURSE: 0,
    SLOW: 1,
    POISON: 2,
    STUN: 3,
    CRITICAL: 4,
    PENETRATE: 5,
};

const MobResistsEnum = {
    SWORD: 0,
    TWOHAND: 1,
    DAGGER: 2,
    BELL: 3,
    FAN: 4,
    BOW: 5,
    FIRE: 6,
    ELECT: 7,
    MAGIC: 8,
    WIND: 9,
    POISON: 10,
};

const MobBattleTypeEnum = {
    POWER: 0,
    TANKER: 1,
    SUPER_POWER: 2,
    SUPER_TANKER: 3,
    RANGE: 4,
    MAGIC: 5,
};

const RaceFlagsEnum = {
    ANIMAL: 1 << 0,
    UNDEAD: 1 << 1,
    DEVIL: 1 << 2,
    HUMAN: 1 << 3,
    ORC: 1 << 4,
    MILGYO: 1 << 5,
    INSECT: 1 << 6,
    FIRE: 1 << 7,
    ICE: 1 << 8,
    DESERT: 1 << 9,
    TREE: 1 << 10,
    ATT_ELEC: 1 << 11,
    ATT_FIRE: 1 << 12,
    ATT_ICE: 1 << 13,
    ATT_WIND: 1 << 14,
    ATT_EARTH: 1 << 15,
    ATT_DARK: 1 << 16,
};

export default class MobManager {
    #config;

    constructor({ config }) {
        this.#config = config;
    }

    load() {
        this.#config.monsters.forEach((monster) => {
            console.log(monster.ai_flag);
        });
    }

    toMonster() {}
}
