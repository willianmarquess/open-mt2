import Monster from '../Monster';
import MonsterEventsEnum from './MonsterEventsEnum';

export default class MonsterMovedEvent {
    public static readonly type = MonsterEventsEnum.MONSTER_MOVED;
    public readonly entity: Monster;
    public readonly params: {
        positionX: number;
        positionY: number;
        arg: number;
        rotation: number;
        time: number;
        movementType: number;
        duration: number;
    };

    constructor({ entity, params }) {
        this.entity = entity;
        this.params = params;
    }
}
