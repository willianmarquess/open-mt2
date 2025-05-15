import Monster from '../Monster';
import MonsterEventsEnum from './MonsterEventsEnum';

type ParamsType = {
    positionX: number;
    positionY: number;
    arg: number;
    rotation: number;
    time: number;
    movementType: number;
    duration: number;
};

export default class MonsterMovedEvent {
    public static readonly type = MonsterEventsEnum.MONSTER_MOVED;
    public readonly entity: Monster;
    public readonly params: ParamsType;

    constructor({ entity, params }: { entity: Monster; params: ParamsType }) {
        this.entity = entity;
        this.params = params;
    }
}
