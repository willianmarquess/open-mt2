export enum ItemImmuneFlagEnum {
    PARA = 0b1,
    CURSE = 0b10,
    STUN = 0b100,
    SLEEP = 0b1000,
    SLOW = 0b1_0000,
    POISON = 0b10_0000,
    TERROR = 0b100_0000,
    DEFAULT = 0b1000_0000,
}
