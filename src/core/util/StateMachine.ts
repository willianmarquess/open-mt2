import { EntityStateEnum } from '../enum/EntityStateEnum';

export interface State {
    onTick(): void;
    onStart?(): void;
    onEnd?(): void;
    name: EntityStateEnum;
}

//TODO: add state durantion/delay based on tick per second

export class StateMachine {
    private states: Map<EntityStateEnum, State> = new Map();
    private currentState: State;

    addState(state: State) {
        this.states.set(state.name, state);
        return this;
    }

    getCurrentState() {
        return this.currentState;
    }

    getCurrentStateName() {
        return this.currentState.name;
    }

    overrideState(state: Partial<State>) {
        const oldState = this.states.get(state.name);

        if (!oldState) return;

        const newState = {
            ...oldState,
            ...state,
        };

        this.states.set(newState.name, newState);
        return this;
    }

    gotoState(name: EntityStateEnum) {
        if (name === this.currentState?.name) return;

        const state = this.states.get(name);
        if (!state) return;

        this.currentState?.onEnd?.();
        this.currentState = state;
        this.currentState.onStart?.();
    }

    tick() {
        this.currentState?.onTick();
    }
}
