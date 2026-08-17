import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import {
    EnterExecutionContext,
    KillExecutionContext,
    LoginExecutionContext,
    Quest,
    Task,
} from '../decorators/QuestDecorator';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { PlayerQuest } from '../facade/PlayerQuest';

const questConfigs = [
    {
        minLvl: 1,
        target: {
            id: 101,
            name: 'Stray Dog',
            count: 1,
        },
        rewards: {
            gold: 1_000,
            exp: 5_000,
        },
    },
    {
        minLvl: 10,
        target: {
            id: 109,
            name: 'Wild Boar',
            count: 10,
        },
        rewards: {
            gold: 10_000,
            exp: 50_000,
        },
    },
];

enum HuntQuestState {
    START = 'START',
    HUNT = 'HUNT',
    REWARD = 'REWARD',
}

@Quest('HuntQuest', HuntQuestState.START)
export class HuntQuest extends AbstractQuest {
    private getCurrentConfig() {
        const index = Number(this.getValue('currentQuestIndex'));
        const questConfig = questConfigs[index];
        return questConfig;
    }

    private getKillCount() {
        return Number(this.getValue('killCount') || 0);
    }

    private increaseKillCount() {
        const currentKillCount = this.getKillCount();
        const killCount = currentKillCount + 1;
        this.addValue('killCount', killCount);
        return killCount;
    }

    private clearKillCount() {
        this.addValue('killCount', 0);
    }

    private start(player: PlayerQuest) {
        const index = Number(this.getValue('nextQuestIndex')) || 0;

        const questConfig = questConfigs[index];

        if (questConfig) {
            if (player.getLevel() >= questConfig.minLvl) {
                this.addValue('currentQuestIndex', index);
                this.addValue('nextQuestIndex', index + 1);
                return this.nextState(HuntQuestState.HUNT);
            }
        }
    }

    @Task({ state: HuntQuestState.START, when: QuestEventEnum.LOGIN })
    public async startOnLogin({ player }: LoginExecutionContext) {
        return this.start(player);
    }

    @Task({ state: HuntQuestState.START, when: QuestEventEnum.LEVELUP })
    public async startOnLevelUp({ player }: LoginExecutionContext) {
        return this.start(player);
    }

    @Task({ state: HuntQuestState.START, when: QuestEventEnum.ENTER_STATE })
    public async startOnEnterState({ player }: LoginExecutionContext) {
        return this.start(player);
    }

    @Task({ state: HuntQuestState.HUNT, when: QuestEventEnum.LETTER })
    public async huntOnLetter() {
        this.letter('Hunt Quest');
    }

    private huntOnLetterDescribeQuest() {
        const questConfig = this.getCurrentConfig();

        if (!questConfig) return;

        const { minLvl, target } = questConfig;

        this.title(`Hunt Quest lvl ${minLvl}`);
        this.text(`Please, try to kill ${target.count} of ${target.name}`);
        this.text('Good luck!');

        const killCount = this.getKillCount();

        if (killCount > 0) {
            this.text(`${target.count - killCount} left.`);
            this.text('Stay strong!');
        }
    }

    @Task({ state: HuntQuestState.HUNT, when: QuestEventEnum.BUTTON })
    public async huntOnLetterButton() {
        this.huntOnLetterDescribeQuest();
    }

    @Task({ state: HuntQuestState.HUNT, when: QuestEventEnum.INFO })
    public async huntOnLetterInfo() {
        this.huntOnLetterDescribeQuest();
    }

    @Task({ state: HuntQuestState.HUNT, when: QuestEventEnum.KILL })
    public async huntOnKill({ victim }: KillExecutionContext) {
        const questConfig = this.getCurrentConfig();

        if (!questConfig) return;

        const { target } = questConfig;

        if (victim.getMonsterId() === target.id) {
            const killCount = this.increaseKillCount();

            if (killCount >= target.count) {
                this.clearKillCount();
                return this.nextState(HuntQuestState.REWARD);
            }
        }
    }

    @Task({ state: HuntQuestState.REWARD, when: QuestEventEnum.ENTER_STATE })
    public async rewardOnEnter({ player }: EnterExecutionContext) {
        return this.reward(player);
    }

    @Task({ state: HuntQuestState.REWARD, when: QuestEventEnum.LOGIN })
    public async rewardOnLogin({ player }: EnterExecutionContext) {
        return this.reward(player);
    }

    private async reward(player: PlayerQuest) {
        const questConfig = this.getCurrentConfig();

        if (!questConfig) return;

        const { minLvl, rewards } = questConfig;

        this.title(`Quest Complete!`);
        this.text(`Congratulations, you complete the Hunt Quest Lvl ${minLvl}`);
        this.text(`You rewards: `);

        const exp = (rewards.exp / 100) * player.getPoint(PointsEnum.EXPERIENCE);

        this.text(`Gold: ${rewards.gold}`);
        this.text(`Exp: ${exp}`);

        await this.giveGold(rewards.gold);
        await this.giveExp(exp);

        this.clearLetter();
        return this.nextState(HuntQuestState.START);
    }
}
