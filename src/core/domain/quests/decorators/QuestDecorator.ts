import 'reflect-metadata';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { QuestUtil } from '../QuestUtil';
import { PlayerQuest } from '../facade/PlayerQuest';
import { VictimQuest } from '../facade/VictimQuest';
import { NpcQuest } from '../facade/NpcQuest';

const QUEST_META = Symbol('quest');

export enum QuestStatusEnum {
    NONE,
    PAUSE,
    SELECT,
    INPUT,
    CONFIRM,
    SELECT_ITEM,
}

export type ContextBase = {
    player: PlayerQuest;
};

export type ClickExecutionContext = ContextBase & { npc: NpcQuest } & { eventType: QuestEventEnum.CLICK };
export type ChatExecutionContext = ContextBase & { npc: NpcQuest } & { eventType: QuestEventEnum.CHAT };
export type KillExecutionContext = ContextBase & { victim: VictimQuest } & { eventType: QuestEventEnum.KILL };
export type EnterExecutionContext = ContextBase & { eventType: QuestEventEnum.ENTER_STATE };
export type LeaveExecutionContext = ContextBase & { eventType: QuestEventEnum.LEAVE_STATE };
export type LoginExecutionContext = ContextBase & { eventType: QuestEventEnum.LOGIN };
export type LogoutExecutionContext = ContextBase & { eventType: QuestEventEnum.LOGOUT };
export type LevelUpExecutionContext = ContextBase & { eventType: QuestEventEnum.LEVELUP };
export type LetterExecutionContext = ContextBase & { eventType: QuestEventEnum.LETTER };
export type InfoExecutionContext = ContextBase & { eventType: QuestEventEnum.INFO };
export type ButtonExecutionContext = ContextBase & { eventType: QuestEventEnum.BUTTON };

export type StateExecutionContext =
    | ClickExecutionContext
    | ChatExecutionContext
    | KillExecutionContext
    | EnterExecutionContext
    | LeaveExecutionContext
    | LoginExecutionContext
    | LogoutExecutionContext
    | LevelUpExecutionContext
    | LetterExecutionContext
    | InfoExecutionContext
    | ButtonExecutionContext;

export type StateExecutionContextBase =
    | Omit<ClickExecutionContext, 'player'>
    | Omit<ChatExecutionContext, 'player'>
    | Omit<KillExecutionContext, 'player'>
    | Omit<EnterExecutionContext, 'player'>
    | Omit<LeaveExecutionContext, 'player'>
    | Omit<LoginExecutionContext, 'player'>
    | Omit<LogoutExecutionContext, 'player'>
    | Omit<LevelUpExecutionContext, 'player'>
    | Omit<LetterExecutionContext, 'player'>
    | Omit<InfoExecutionContext, 'player'>
    | Omit<ButtonExecutionContext, 'player'>;

export type ConditionFunc = (args: StateExecutionContext) => boolean | Promise<boolean>;

export type TaskResult = void | { nextState: string };
export type TaskCallback = (args: StateExecutionContext) => Promise<TaskResult> | TaskResult;

export type Event = {
    [QuestEventEnum.CLICK]: {
        readonly state: string;
        readonly when: QuestEventEnum.CLICK;
        target: number;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.CHAT]: {
        readonly state: string;
        readonly when: QuestEventEnum.CHAT;
        target: number;
        chat: string;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.KILL]: {
        readonly state: string;
        readonly when: QuestEventEnum.KILL;
        target: number;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.LEVELUP]: {
        readonly state: string;
        readonly when: QuestEventEnum.LEVELUP;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.LOGIN]: {
        readonly state: string;
        readonly when: QuestEventEnum.LOGIN;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.LOGOUT]: {
        readonly state: string;
        readonly when: QuestEventEnum.LOGOUT;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.LEAVE_STATE]: {
        readonly state: string;
        readonly when: QuestEventEnum.LEAVE_STATE;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
    [QuestEventEnum.ENTER_STATE]: {
        readonly state: string;
        readonly when: QuestEventEnum.ENTER_STATE;
        readonly with?: ConditionFunc;
        readonly callback: TaskCallback;
    };
};

export type QuestTask =
    | Event[QuestEventEnum.CLICK]
    | Event[QuestEventEnum.CHAT]
    | Event[QuestEventEnum.KILL]
    | Event[QuestEventEnum.LEVELUP]
    | Event[QuestEventEnum.LOGIN]
    | Event[QuestEventEnum.LOGOUT]
    | Event[QuestEventEnum.LEAVE_STATE]
    | Event[QuestEventEnum.ENTER_STATE];

export type State = {
    readonly name: string;
    readonly tasks: ReadonlyArray<QuestTask>;
    wasStarted?: boolean;
    title?: string;
    clockName?: string;
    clockValue?: number;
    counterName?: string;
    counterValue?: number;
    iconFile?: string;
};

export type MetaTask = {
    readonly when: QuestEventEnum;
    target?: number;
    chat?: string;
    readonly with?: ConditionFunc;
    readonly handlerName: string;
};

export type MetaState = {
    readonly name: string;
    readonly tasks: MetaTask[];
};

export type QuestMeta = {
    name: string;
    states: Map<string, MetaState>;
    id: number;
    initialState: string;
};

type ConstructorType = new (...args: any[]) => any;

export function getQuestMeta(ctor: ConstructorType): QuestMeta | undefined {
    return Reflect.getMetadata(QUEST_META, ctor);
}

export function Quest(name: string, initialState: string) {
    return function (ctor: ConstructorType) {
        const existing: QuestMeta | undefined = Reflect.getMetadata(QUEST_META, ctor);
        const numericId = QuestUtil.getNextId();
        if (existing) {
            existing.id = numericId;
            existing.name = name;
            existing.initialState = initialState;
            Reflect.defineMetadata(QUEST_META, existing, ctor);
            return;
        }

        const questMetaDefinition: QuestMeta = { id: numericId, states: new Map(), name, initialState };
        Reflect.defineMetadata(QUEST_META, questMetaDefinition, ctor);
    };
}

export type TaskDecoratorOpts = {
    state: string;
} & Omit<MetaTask, 'handlerName'>;

export function Task(opts: TaskDecoratorOpts) {
    return function (target: any, key: string) {
        const ctor = target.constructor;
        const meta =
            Reflect.getMetadata(QUEST_META, ctor) ??
            (() => {
                const m: QuestMeta = {
                    id: QuestUtil.getNextId(),
                    states: new Map<string, MetaState>(),
                    name: ctor.name,
                    initialState: opts.state,
                };
                Reflect.defineMetadata(QUEST_META, m, ctor);
                return m;
            })();

        let state = meta.states.get(opts.state);
        if (!state) {
            state = { name: opts.state, tasks: [] };
            meta.states.set(opts.state, state);
        }

        const metaTask: MetaTask = {
            when: opts.when,
            with: opts.with,
            handlerName: key,
        };

        if ((opts as any).target !== undefined) {
            metaTask.target = (opts as any).target;
        }

        if ((opts as any).chat !== undefined) {
            metaTask.chat = (opts as any).chat;
        }

        state.tasks.push(metaTask);
    };
}
