import Monster from '../Monster';
import MonsterEventsEnum from './MonsterEventsEnum';

export default class MonsterDiedEvent {
    public static readonly type = MonsterEventsEnum.MONSTER_DIED;
    public readonly entity: Monster;

    constructor({ entity }) {
        this.entity = entity;
    }
}
