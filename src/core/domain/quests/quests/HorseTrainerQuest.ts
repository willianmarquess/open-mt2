import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { Quest, Task } from '../decorators/QuestDecorator';
import { ITEM_HORSE_SUMMON_BOOK_1 } from '@/game/app/service/UseItemService';

enum HorseTrainerQuestState {
    START = 'START',
}

const HORSE_TRAINER_NPC_VNUM = 20349;
const REQUIRED_LEVEL = 30;

@Quest('HorseTrainerQuest', HorseTrainerQuestState.START)
export class HorseTrainerQuest extends AbstractQuest {
    @Task({
        state: HorseTrainerQuestState.START,
        when: QuestEventEnum.CHAT,
        target: HORSE_TRAINER_NPC_VNUM,
        chat: 'Train a Horse',
        with: ({ player }) => player.getLevel() >= REQUIRED_LEVEL && player.getHorseLevel() === 0,
    })
    async onChat() {
        // Offer the horse
        this.title('Horse Trainer');
        this.text('Greetings, brave warrior!');
        this.text(`You have proven yourself worthy. I can grant you a horse to aid you on your journey.`);
        await this.nextPage();

        this.text('Would you like to receive your horse?');
        const answer = await this.select(['Yes, grant me a horse!', 'Not yet.']);

        if (answer === 0) {
            this.giveHorse(1);
            await this.giveItem(ITEM_HORSE_SUMMON_BOOK_1);
            this.title('Horse Trainer');
            this.text('Excellent! Your horse awaits you.');
            this.text('Use the horse summon book to call it to your side.');
            this.text('Treat it well - feed it, rest it, and it will serve you faithfully.');
        } else {
            this.title('Horse Trainer');
            this.text('Very well. Return when you are ready.');
        }
    }
}
