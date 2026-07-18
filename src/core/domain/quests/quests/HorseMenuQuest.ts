import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { ClickExecutionContext, Quest, Task } from '../decorators/QuestDecorator';
import { REVIVE_HERB_BY_GRADE } from './HorseReviveQuest';

enum HorseMenuQuestState {
    START = 'START',
}

const HORSE_VNUMS = [20030, 20101, 20102, 20103, 20104, 20105, 20106, 20107, 20108, 20109];
const RENAME_SUGAR_VNUM = 71110;

const DeadMenuOption = {
    REVIVE: 0,
    SEND_AWAY: 1,
    NOTHING: 2,
} as const;

const MainMenuOption = {
    FEED: 0,
    MOUNT: 1,
    SEND_AWAY: 2,
    STATS: 3,
    RENAME: 4,
    NOTHING: 5,
} as const;

const RenameMenuOption = {
    WIND: 0,
    STORM: 1,
    THUNDER: 2,
    SHADOW: 3,
    BLIZZARD: 4,
    CUSTOM: 5,
    CANCEL: 6,
} as const;

const SetNameResult = {
    INVALID: 0,
    SAME_NAME: 1,
    SUCCESS: 2,
} as const;

@Quest('HorseMenuQuest', HorseMenuQuestState.START)
export class HorseMenuQuest extends AbstractQuest {
    @Task({ state: HorseMenuQuestState.START, when: QuestEventEnum.CLICK, target: HORSE_VNUMS })
    async onClick({ npc }: ClickExecutionContext) {
        if (!HORSE_VNUMS.includes(npc.getId())) return;
        if (!npc.isMine()) return;

        const playerInstance = this.player;

        this.text('What would you like to do with your horse?');
        this.text('');

        const isDead = playerInstance.getHorseHealth() <= 0;
        if (isDead) {
            const selection = await this.select(['Revive Horse', 'Send Away', 'Nothing (close window)']);

            const grade = playerInstance.getHorseGrade();
            const herb = REVIVE_HERB_BY_GRADE[grade];

            switch (selection) {
                case DeadMenuOption.REVIVE:
                    if (!herb) return;

                    if (this.countItem(herb) > 0 && playerInstance.reviveHorse()) {
                        await this.removeItem(herb, 1);
                        playerInstance.startRiding();
                    }
                    break;
                case DeadMenuOption.SEND_AWAY:
                    playerInstance.sendHorseAway();
                    break;
                case DeadMenuOption.NOTHING:
                default:
                    break;
            }
        } else {
            const selection = await this.select([
                'Feed',
                'Mount',
                'Send Away',
                'Check Horse Stats',
                'Rename Horse',
                'Nothing (close window)',
            ]);

            switch (selection) {
                case MainMenuOption.FEED:
                    await this.handleFeed();
                    break;
                case MainMenuOption.MOUNT:
                    playerInstance.startRiding();
                    break;
                case MainMenuOption.SEND_AWAY:
                    playerInstance.sendHorseAway();
                    break;
                case MainMenuOption.STATS:
                    this.handleStats();
                    break;
                case MainMenuOption.RENAME:
                    await this.handleRename();
                    break;
                case MainMenuOption.NOTHING:
                default:
                    break;
            }
        }
    }

    private async handleFeed() {
        const grade = this.player.getHorseGrade();
        const food = grade + 50054 - 1;
        if (this.countItem(food) > 0) {
            await this.removeItem(food, 1);
            this.player.feedHorse();
        } else {
            this.text(`You need the following for this: ${this.getItemName(food)}`);
            this.text('');
        }
    }

    private handleStats() {
        const healthPct = Math.round((this.player.getHorseHealth() * 100) / this.player.getHorseMaxHealth());
        const staminaPct = Math.round((this.player.getHorseStamina() * 100) / this.player.getHorseMaxStamina());
        this.text(`Current horse health: ${healthPct}%`);
        this.text(`Current horse stamina: ${staminaPct}%`);
        this.text('');
    }

    private async handleRename() {
        if (this.countItem(RENAME_SUGAR_VNUM) < 1) {
            this.text(`You need the following for this: ${this.getItemName(RENAME_SUGAR_VNUM)}`);
            this.text('');
            return;
        }

        const oldHorseName = this.player.getHorseName();
        this.title('Rename Horse');
        this.text('With Horse Sugar you can give your horse a new name.');
        this.text('');
        if (!oldHorseName || oldHorseName.length === 0) {
            this.text('Your horse does not have a name yet.');
        } else {
            this.text(`Your horse is currently named ${oldHorseName}.`);
        }
        this.text('');

        const presetNames = ['Wind', 'Storm', 'Thunder', 'Shadow', 'Blizzard'];
        const nameSelection = await this.select([
            ...presetNames,
            'Custom name (type /horse_name <name> in chat)',
            'Cancel',
        ]);

        switch (nameSelection) {
            case RenameMenuOption.WIND:
            case RenameMenuOption.STORM:
            case RenameMenuOption.THUNDER:
            case RenameMenuOption.SHADOW:
            case RenameMenuOption.BLIZZARD: {
                const chosenName = presetNames[nameSelection];
                const ret = this.player.setHorseName(chosenName);
                this.title('Rename Horse');
                switch (ret) {
                    case SetNameResult.INVALID:
                    case SetNameResult.SAME_NAME:
                        this.text('You cannot use this name!');
                        this.text('');
                        break;
                    case SetNameResult.SUCCESS:
                        await this.removeItem(RENAME_SUGAR_VNUM, 1);
                        this.text('Your horse now has a new name!');
                        this.text('');
                        break;
                }
                break;
            }
            case RenameMenuOption.CUSTOM:
                this.title('Rename Horse');
                this.text('With Horse Sugar you can give your horse a custom name.');
                this.text('Type /horse_name <name> in chat to set it.');
                this.text('Example: /horse_name Storm');
                this.text('');
                break;
            case RenameMenuOption.CANCEL:
            default:
                break;
        }
    }

    private getItemName(vnum: number): string {
        return this.itemManager.getItem(vnum)?.getName() || `item #${vnum}`;
    }
}
