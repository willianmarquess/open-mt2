import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import {
    ButtonExecutionContext,
    ClickExecutionContext,
    ConfitionFuncParams,
    InfoExecutionContext,
    StateExecutionContext,
    Task,
    TaskResult,
} from '../decorators/QuestDecorator';
import { PlayerQuest } from '../facade/PlayerQuest';
import { AssasinSubJobEnum, ShamanSubJobEnum, SuraSubJobEnum, WarriorSubJobEnum } from '@/core/enum/SubJobEnum';

enum SkillQuestState {
    START = 'START',
    RUN = 'RUN',
    CONFIRM = 'CONFIRM',
}

const TARGET_NAME = 'skill_teacher';

export class SkillQuest extends AbstractQuest {
    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.LOGIN,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnLogin(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.ENTER_STATE,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnEnterState(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({
        state: SkillQuestState.START,
        when: QuestEventEnum.LEVELUP,
        with: ({ player }: StateExecutionContext) => player.getLevel() > 5 && !player.hasSkillGroup(),
    })
    public async startOnLevelUp(): Promise<TaskResult> {
        return this.nextState(SkillQuestState.RUN);
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.LETTER })
    public async runOnLetter() {
        this.letter('Skill Quest');
    }

    private async onLetterDescribeQuest({ player }: { player: PlayerQuest }) {
        this.title('Skill Quest');
        this.text('Select one option: ');

        let option: number = 0;

        switch (true) {
            case player.isSura():
                option = await this.select(['Sword', 'Magic']);
                break;
            case player.isWarrior():
                option = await this.select(['Body', 'Mental']);
                break;
            case player.isAssassin():
                option = await this.select(['Dagger', 'Archer']);
                break;
            case player.isShaman():
                option = await this.select(['Buffer', 'Healer']);
                break;
        }

        this.addValue('skillGroup', option + 1);

        const npcVnum = this.getNpcSkillTeacher(option + 1);

        if (!npcVnum) return;

        this.sendTarget({ vnum: npcVnum, name: TARGET_NAME });

        this.clearLetter();

        return this.nextState(SkillQuestState.CONFIRM);
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.BUTTON })
    public async runOnLetterButton({ player }: ButtonExecutionContext) {
        return this.onLetterDescribeQuest({ player });
    }

    @Task({ state: SkillQuestState.RUN, when: QuestEventEnum.INFO })
    public async runOnLetterInfo({ player }: InfoExecutionContext) {
        return this.onLetterDescribeQuest({ player });
    }

    /*
     * WARRIOR
     */

    /*
     * RED
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20300,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromRed() && quest.getValue('skillGroup') == WarriorSubJobEnum.BODY,
    })
    public async confirmOnClickWarriorBodyRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20301,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromRed() && quest.getValue('skillGroup') == WarriorSubJobEnum.MENTAL,
    })
    public async confirmOnClickWarriorMentalRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * YELLOW
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20320,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromYellow() && quest.getValue('skillGroup') == WarriorSubJobEnum.BODY,
    })
    public async confirmOnClickWarriorBodyYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20321,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromYellow() && quest.getValue('skillGroup') == WarriorSubJobEnum.MENTAL,
    })
    public async confirmOnClickWarriorMentalYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * BLUE
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20340,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromBlue() && quest.getValue('skillGroup') == WarriorSubJobEnum.BODY,
    })
    public async confirmOnClickWarriorBodyBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20341,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isWarrior() && player.isFromBlue() && quest.getValue('skillGroup') == WarriorSubJobEnum.MENTAL,
    })
    public async confirmOnClickWarriorMentalBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * ASSASIN
     */

    /*
     * RED
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20302,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromRed() && quest.getValue('skillGroup') == AssasinSubJobEnum.DAGGER,
    })
    public async confirmOnClickAssasinDaggerRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20303,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromRed() && quest.getValue('skillGroup') == AssasinSubJobEnum.ARCHER,
    })
    public async confirmOnClickAssasinArcherRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * Yellow
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20322,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromYellow() && quest.getValue('skillGroup') == AssasinSubJobEnum.DAGGER,
    })
    public async confirmOnClickAssasinDaggerYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20323,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromYellow() && quest.getValue('skillGroup') == AssasinSubJobEnum.ARCHER,
    })
    public async confirmOnClickAssasinArcherYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * Blue
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20342,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromBlue() && quest.getValue('skillGroup') == AssasinSubJobEnum.DAGGER,
    })
    public async confirmOnClickAssasinDaggerBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20343,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isAssassin() && player.isFromBlue() && quest.getValue('skillGroup') == AssasinSubJobEnum.ARCHER,
    })
    public async confirmOnClickAssasinArcherBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * SURA
     */

    /*
     * RED
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20304,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromRed() && quest.getValue('skillGroup') == SuraSubJobEnum.SWORD,
    })
    public async confirmOnClickSuraSwordRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20305,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromRed() && quest.getValue('skillGroup') == SuraSubJobEnum.MAGIC,
    })
    public async confirmOnClickSuraMagicRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * YELLOW
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20324,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromYellow() && quest.getValue('skillGroup') == SuraSubJobEnum.SWORD,
    })
    public async confirmOnClickSuraSwordYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20325,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromYellow() && quest.getValue('skillGroup') == SuraSubJobEnum.MAGIC,
    })
    public async confirmOnClickSuraMagicYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * BLUE
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20344,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromBlue() && quest.getValue('skillGroup') == SuraSubJobEnum.SWORD,
    })
    public async confirmOnClickSuraSwordBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20345,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isSura() && player.isFromBlue() && quest.getValue('skillGroup') == SuraSubJobEnum.MAGIC,
    })
    public async confirmOnClickSuraMagicBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * SHAMAN
     */

    /*
     * RED
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20306,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromRed() && quest.getValue('skillGroup') == ShamanSubJobEnum.BUFFER,
    })
    public async confirmOnClickShamanBufferRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20307,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromRed() && quest.getValue('skillGroup') == ShamanSubJobEnum.HEALER,
    })
    public async confirmOnClickShamanHealerRed({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * YELLOW
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20326,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromYellow() && quest.getValue('skillGroup') == ShamanSubJobEnum.BUFFER,
    })
    public async confirmOnClickShamanBufferYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20327,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromYellow() && quest.getValue('skillGroup') == ShamanSubJobEnum.HEALER,
    })
    public async confirmOnClickShamanHealerYellow({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    /*
     * BLUE
     */
    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20346,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromBlue() && quest.getValue('skillGroup') == ShamanSubJobEnum.BUFFER,
    })
    public async confirmOnClickShamanBufferBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    @Task({
        state: SkillQuestState.CONFIRM,
        when: QuestEventEnum.CLICK,
        target: 20347,
        with: ({ player, quest }: ConfitionFuncParams) =>
            player.isShaman() && player.isFromBlue() && quest.getValue('skillGroup') == ShamanSubJobEnum.HEALER,
    })
    public async confirmOnClickShamanHealerBlue({ player }: ClickExecutionContext): Promise<TaskResult> {
        return this.askToConfirm({ player });
    }

    private async askToConfirm({ player }: { player: PlayerQuest }) {
        this.title('Skill Quest');
        this.text('Do you want to confirm? Are you sure?');
        const option = await this.select(['Yes', 'No']);

        this.removeTarget({ name: TARGET_NAME });

        if (option === 0) {
            this.text('Thank you and congrats!!');
            player.setSkillGroup(this.getValue('skillGroup'));
        }
    }
}
