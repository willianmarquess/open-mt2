import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { ClickExecutionContext, Quest, Task } from '../decorators/QuestDecorator';

enum HorseTicketQuestState {
    START = 'START',
}

const STABLE_MASTER_VNUM = 20349;
const REQUIRED_LEVEL = 11;
const HORSE_TICKET_VNUM = 50083;
const RENTAL_MOUNT_VNUM = 20030;
const RENTAL_DURATION_MS = 10 * 60 * 1_000;
const RENTAL_COOLDOWN_SECONDS = 60 * 60;

@Quest('HorseTicketQuest', HorseTicketQuestState.START)
export class HorseTicketQuest extends AbstractQuest {
    private lastRentalAt = 0;

    @Task({ state: HorseTicketQuestState.START, when: QuestEventEnum.CLICK, target: STABLE_MASTER_VNUM })
    async onClick({ player }: ClickExecutionContext) {
        if (player.getLevel() < REQUIRED_LEVEL || player.getPlayerInstance().isHorseRiding()) return;

        const now = Math.floor(Date.now() / 1_000);
        if (now - this.lastRentalAt < RENTAL_COOLDOWN_SECONDS) {
            this.text('You can rent a horse once per hour.');
            this.text('Come back when you want to rent a horse.');
            return;
        }

        this.title('Stable Master:');
        this.text('Do you want to ride a horse? We can rent you');
        this.text('a horse with a riding card for up to 10 minutes.');
        this.text('You can ride the horse, but you cannot attack with it.');
        this.text('');

        if ((await this.select(['Ride a Horse', "Don't Ride"])) !== 0) return;
        if (this.countItem(HORSE_TICKET_VNUM) < 1) {
            this.text('You need a riding ticket.');
            return;
        }

        const mounted = player.getPlayerInstance().startTemporaryRiding(RENTAL_MOUNT_VNUM, RENTAL_DURATION_MS);
        if (!mounted) return;

        await this.removeItem(HORSE_TICKET_VNUM, 1);
        this.lastRentalAt = now;
    }
}
