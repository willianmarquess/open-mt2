import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { Quest, Task } from '../decorators/QuestDecorator';

enum HorseReviveQuestState {
    START = 'START',
}

const STABLE_MASTER_VNUM = 20349;
export const REVIVE_HERB_BY_GRADE: Record<number, number> = {
    1: 50057,
    2: 50058,
    3: 50059,
};

@Quest('HorseReviveQuest', HorseReviveQuestState.START)
export class HorseReviveQuest extends AbstractQuest {
    @Task({
        state: HorseReviveQuestState.START,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'I want to revive my horse.',
        with: ({ player }) => player.getHorseGrade() > 0 && player.getHorseHealth() <= 0,
    })
    async onChat() {
        const grade = this.player.getHorseGrade();
        const herb = REVIVE_HERB_BY_GRADE[grade];

        if (!herb) return;

        if (this.countItem(herb) < 1) {
            this.title('Stable Master:');
            this.text(this.getMissingHerbMessage(grade));

            for (const otherHerb of Object.values(REVIVE_HERB_BY_GRADE)) {
                if (otherHerb !== herb && this.countItem(otherHerb) > 0) {
                    this.text(`Herbs from another dungeon are only suitable for a different horse grade.`);
                    break;
                }
            }
            return;
        }

        this.text(`These herbs will revive your horse.`);
        this.text(`Let's summon the horse first.`);
        await this.nextPage();
        this.text(`Your horse is starting to revive.`);
        this.text(`Do not forget to feed your horse in the future.`);

        if (this.countItem(herb) > 0 && this.player.reviveHorse()) {
            await this.removeItem(herb, 1);
        }
    }

    private getMissingHerbMessage(grade: number): string {
        switch (grade) {
            case 1:
                return `You can only revive a beginner horse with herbs from the Weak Monkey Dungeon.`;
            case 2:
                return `You can only revive an intermediate horse with herbs from the Normal Monkey Dungeon.`;
            case 3:
                return `You can only revive an advanced horse with herbs from the Strong Monkey Dungeon.`;
            default:
                return `You need the correct herbs to revive your horse.`;
        }
    }
}
