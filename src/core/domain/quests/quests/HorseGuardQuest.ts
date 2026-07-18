import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { Quest, Task } from '../decorators/QuestDecorator';

enum HorseGuardQuestState {
    START = 'START',
}

const STABLE_MASTER_VNUM = 20349;

const HORSE_INFORMATION = [
    ['To go on a mission on horseback, you need', 'a Horse Medallion. You can get it from the Monkey Dungeon.'],
    [
        'Horses have three levels: Beginner, Advanced, and Expert.',
        'When you have trained enough and want to advance',
        'to the next level, you must take an exam.',
    ],
    [
        'Horses need food appropriate to their level',
        'due to the way their riders train them.',
        'Beginner horses eat hay, advanced horses eat carrots,',
        'and expert horses only eat red ginseng. They',
        'have refined tastes.',
    ],
    [
        'If your horse is healthy, the indicator appears green;',
        'if hungry, yellow; if near death, red. To go from red or',
        'yellow back to green, you must feed it. This is',
        'serious - what if your horse dies!',
    ],
    [
        'When you ride a horse, its fatigue increases and its health',
        'decreases. Since you cannot ride an unhealthy horse,',
        'you must let it rest from time to time.',
    ],
    [
        'According to a rumor, dead horses can be',
        'revived again. But the Monkeys guard the herbs',
        'needed for this, and obtaining them is very difficult.',
        'If the Monkeys catch you, they will curse you and',
        'turn you into a monkey too.',
    ],
    [
        'There are different riding levels and you can',
        "also raise your horse's level. But only a person",
        'who possesses a Horse Medallion can',
        'level up a horse.',
    ],
] as const;

@Quest('HorseGuardQuest', HorseGuardQuestState.START)
export class HorseGuardQuest extends AbstractQuest {
    @Task({
        state: HorseGuardQuestState.START,
        when: QuestEventEnum.CHAT,
        target: STABLE_MASTER_VNUM,
        chat: 'Information about Horses',
    })
    async onClick() {
        const information = HORSE_INFORMATION[Math.floor(Math.random() * HORSE_INFORMATION.length)];

        this.title('Stable Master:');
        for (const line of information) {
            this.text(line);
        }
        this.text('');
    }
}
