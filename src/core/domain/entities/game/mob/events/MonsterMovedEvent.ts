import { Mob } from '../Mob';
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

/** Despite the name (kept for now to limit churn), Area.onMonsterMove only ever touches generic
 * Mob/Character/GameEntity methods on `entity` - Stone reuses this same event to broadcast its own
 * idle-tick attack motion (char_state.cpp:398, __StateIdle_Stone). */
export default class MonsterMovedEvent {
    public static readonly type = MonsterEventsEnum.MONSTER_MOVED;
    public readonly entity: Mob;
    public readonly params: ParamsType;

    constructor({ entity, params }: { entity: Mob; params: ParamsType }) {
        this.entity = entity;
        this.params = params;
    }
}
