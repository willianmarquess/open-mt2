export enum DamageFlagEnum {
    NORMAL = 0b1,
    POISON = 0b10,
    DODGE = 0b100,
    BLOCK = 0b1000,
    PENETRATE = 0b1_0000,
    CRITICAL = 0b10_0000,
}
