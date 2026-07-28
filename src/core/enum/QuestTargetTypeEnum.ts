// Discrete packet values, not combinable flags — plain literals keep
// SonarCloud (S7767) from reading `1 << 0` as a truncation idiom.
export enum QuestTargetTypeEnum {
    POSITION = 1,
    VIRTUAL_ID = 2,
}
