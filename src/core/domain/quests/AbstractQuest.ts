import { QuestSkinEnum } from '@/core/enum/QuestSkinEnum';
import Player from '../entities/game/player/Player';
import { QuestStatusEnum, State, StateExecutionContextBase, TaskResult } from './decorators/QuestDecorator';
import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import BitFlag from '@/core/util/BitFlag';
import { QuestFlagEnum } from '@/core/enum/QuestSendFlagEnum';
import { PlayerQuest } from './facade/PlayerQuest';
import ItemManager from '../manager/ItemManager';
import MathUtil from '../util/MathUtil';

export abstract class AbstractQuest {
    private readonly id!: number;
    private name!: string;
    private readonly states: Map<string, State> = new Map();
    private src: string = '';
    private skin: QuestSkinEnum = QuestSkinEnum.NORMAL;
    private currentChoicePromise: { promise: Promise<any>; resolve: (value?: number) => void | Promise<void> } =
        {} as any;
    private nextPagePromise: { promise: Promise<any>; resolve: (value?: number) => void | Promise<void> } = {} as any;
    private currentState: State | undefined;
    private values: Map<string, any> = new Map();
    private hasReward: boolean = false;
    private status: QuestStatusEnum = QuestStatusEnum.NONE;
    private questFlags: BitFlag = new BitFlag();

    private readonly player: Player;
    private readonly playerQuest: PlayerQuest;
    private readonly itemManager: ItemManager;

    constructor({ player, itemManager }: { player: Player; itemManager: ItemManager }) {
        this.player = player;
        this.playerQuest = new PlayerQuest({ player });
        this.itemManager = itemManager;
    }

    protected nextState(stateName: string): TaskResult {
        return {
            nextState: stateName,
        };
    }

    protected addValue<T>(name: string, value: T) {
        this.values.set(name, value);
    }

    protected getValue<T>(name: string): T {
        return this.values.get(name) as T;
    }

    public getName() {
        return this.name;
    }

    public addState(state: State) {
        this.states.set(state.name, state);
        return this;
    }

    async runState(context: StateExecutionContextBase) {
        if (this.currentState) {
            const tasks = this.getCurrentTasksByEvent(context.eventType);
            for (const routine of tasks) {
                try {
                    const withFunc = routine.with ? routine.with({ player: this.playerQuest, ...context }) : true;
                    let callbackResult: TaskResult | undefined;

                    try {
                        const result = await withFunc;
                        if (result) {
                            this.player.setCurrentQuest(this);
                            callbackResult = await routine.callback({ player: this.playerQuest, ...context });
                        }
                    } catch (err) {
                        console.error('[QUEST] condition error', err);
                    } finally {
                        this.done();
                        this.endRunning(callbackResult);
                    }
                } catch (err) {
                    console.error('[QUEST] runState error', err);
                }
            }
        }
    }

    private getCurrentTasksByEvent(event: QuestEventEnum) {
        return this.currentState?.tasks.filter((routine) => routine.when === event) || [];
    }

    public async setState(name: string) {
        if (!this.currentState) {
            this.currentState = this.states.get(name);
        }

        await this.runState({ eventType: QuestEventEnum.LEAVE_STATE });
        this.currentState = this.states.get(name);
        this.resetStateValues();
        await this.runState({ eventType: QuestEventEnum.ENTER_STATE });
    }

    async nextPage() {
        this.src += '[NEXT]';
        const { resolve, promise } = Promise.withResolvers();
        this.nextPagePromise.resolve = resolve;
        this.nextPagePromise.promise = promise;
        this.skin = QuestSkinEnum.NORMAL;
        this.send();
        this.status = QuestStatusEnum.PAUSE;
        await this.nextPagePromise.promise;
        this.status = QuestStatusEnum.NONE;
    }

    getStatus() {
        return this.status;
    }

    getCurrentState() {
        return this.currentState;
    }

    protected text(text: string): void {
        this.src += text + '[ENTER]';
    }

    protected title(text: string) {
        this.text(`${this.color(255, 230, 186)}${text}${this.color(196, 196, 196)}`);
    }

    private color(r: number, g: number, b: number) {
        return `[COLOR r; ${r / 255.0}|g; ${g / 255.0}|b; ${b / 255.0}]`;
    }

    private button(name: string): string {
        return `[QUESTBUTTON idx; ${this.id}|name; ${name}]`;
    }

    protected delay(value: number) {
        this.src += `[DELAY value; ${value}]`;
    }

    protected letter(title: string) {
        const src = this.button(title);
        this.skin = QuestSkinEnum.NO_WINDOW;
        this.setStart();
        this.setTitle(this.currentState?.title || this.name);
        this.send(src);
        this.skin = QuestSkinEnum.NORMAL;
    }

    protected clearLetter() {
        if (!this.currentState) return;
        this.currentState.wasStarted = false;
        this.questFlags.set(QuestFlagEnum.ISBEGIN);
    }

    protected setSkin(skin: QuestSkinEnum): void {
        this.skin = skin;
    }

    protected async done(silent: boolean = false) {
        if (silent || this.src.length < 1) {
            this.skin = QuestSkinEnum.NO_WINDOW;
        }

        this.src += '[DONE]';
        this.send();
        this.skin = QuestSkinEnum.NORMAL;
    }

    protected send(override: string = '') {
        if (override.length > 0) {
            this.player.sendQuestScript(this.skin, override);
            return;
        }
        this.player.sendQuestScript(this.skin, this.src);
        this.src = '';
    }

    public unselect(answer: number) {
        this.currentChoicePromise.resolve(answer);
    }

    public unpause() {
        this.nextPagePromise.resolve();
    }

    protected async select(options: Array<string>, done: boolean = false) {
        const { resolve, promise } = Promise.withResolvers();
        this.currentChoicePromise.resolve = resolve;
        this.currentChoicePromise.promise = promise;

        this.src += '[QUESTION ';

        for (let i = 0; i < options.length; i++) {
            if (i != 0) {
                this.src += '|';
            }
            this.src += `${i + 1}; ${options[i]}`;
        }

        this.src += ']';

        if (done) {
            this.src += '[DONE]';
        }

        this.send();
        this.status = QuestStatusEnum.SELECT;
        const result = await this.currentChoicePromise.promise;
        this.status = QuestStatusEnum.NONE;
        return result;
    }

    private async endRunning(result?: TaskResult) {
        if (this.hasReward) {
            //TODO: save
        }

        //TODO: send quest info packet
        if (this.questFlags.getFlag() > 0) {
            this.sendInfoPacket();
        }

        if (result && result.nextState && result.nextState !== this.currentState?.name) {
            await this.setState(result.nextState);
            await this.runState({ eventType: QuestEventEnum.LETTER });
        }
    }

    getEvents(): Set<QuestEventEnum> {
        const eventsSet: Set<QuestEventEnum> = new Set();

        for (const state of this.states.values()) {
            const events = state.tasks.map((task) => task.when);
            for (const event of events) {
                eventsSet.add(event);
            }
        }

        return eventsSet;
    }

    getStates() {
        return this.states;
    }

    protected setTitle(title: string) {
        if (!this.currentState) return;
        this.currentState.title = title;
        this.questFlags.set(QuestFlagEnum.TITLE);
    }

    protected setStart() {
        if (!this.currentState) return;
        this.currentState.wasStarted = true;
        this.questFlags.set(QuestFlagEnum.ISBEGIN);
    }

    protected setClockName(name: string) {
        if (!this.currentState) return;
        this.currentState.clockName = name;
        this.questFlags.set(QuestFlagEnum.CLOCK_NAME);
    }

    protected setClockValue(value: number) {
        if (!this.currentState) return;
        this.currentState.clockValue = value;
        this.questFlags.set(QuestFlagEnum.CLOCK_VALUE);
    }

    protected setCounterName(name: string) {
        if (!this.currentState) return;
        this.currentState.counterName = name;
        this.questFlags.set(QuestFlagEnum.COUNTER_NAME);
    }

    protected setCounterValue(value: number) {
        if (!this.currentState) return;
        this.currentState.counterValue = value;
        this.questFlags.set(QuestFlagEnum.COUNTER_VALUE);
    }

    protected setIconFile(src: string) {
        if (!this.currentState) return;
        this.currentState.iconFile = src;
        this.questFlags.set(QuestFlagEnum.ICON_FILE);
    }

    private resetStateValues() {
        this.questFlags.reset();
        if (!this.currentState) return;
        this.currentState.wasStarted = false;
        this.currentState.title = undefined;
        this.currentState.clockName = undefined;
        this.currentState.clockValue = undefined;
        this.currentState.counterName = undefined;
        this.currentState.counterValue = undefined;
        this.currentState.iconFile = undefined;
    }

    private sendInfoPacket() {
        this.player.sendQuestInfoPacket({
            id: this.id,
            flags: this.questFlags.getFlag(),
            title: this.currentState?.title || this.name,
            wasStarted: this.currentState?.wasStarted ? 1 : 0,
            clockName: this.currentState?.clockName,
            clockValue: this.currentState?.clockValue,
            counterName: this.currentState?.counterName,
            counterValue: this.currentState?.counterValue,
            iconFile: this.currentState?.iconFile,
        });
        this.questFlags.reset();
    }

    protected async giveItem(id: number, quantity: number = 1) {
        const item = this.itemManager.getItem(Number(id), Math.min(Number(quantity), MathUtil.MAX_TINY));

        if (!item) {
            //TODO: add log
            return;
        }

        if (this.player.addItem(item)) {
            await this.itemManager.save(item);
        } else {
            //TODO: drop item
        }

        this.hasReward = true;
    }

    protected async giveExp(value: number) {
        this.playerQuest.addExp(value);
        this.hasReward = true;
    }

    protected async giveGold(value: number) {
        this.playerQuest.addGold(value);
    }

    protected giveHorse(level: number = 1) {
        this.player.setHorseLevel(level);
        this.hasReward = true;
    }

    isRunning() {
        return this.status !== QuestStatusEnum.NONE;
    }
}
