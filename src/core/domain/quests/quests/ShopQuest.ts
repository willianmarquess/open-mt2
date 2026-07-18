import { QuestEventEnum } from '@/core/enum/QuestEventEnum';
import { AbstractQuest } from '../AbstractQuest';
import { ClickExecutionContext, Quest, Task } from '../decorators/QuestDecorator';

enum ShopQuestState {
    START = 'START',
}

enum NpcVnumEnum {
    SALESWOMAN = 9003,
}

enum ShopIdEnum {
    GOODS = 666,
    POTIONS = 667,
}

@Quest('ShopQuest', ShopQuestState.START)
export class ShopQuest extends AbstractQuest {
    @Task({ state: ShopQuestState.START, when: QuestEventEnum.CLICK, target: NpcVnumEnum.SALESWOMAN })
    async onClick({ npc }: ClickExecutionContext) {
        const id = npc.getId();

        switch (id) {
            case NpcVnumEnum.SALESWOMAN: {
                this.title('Welcome to my shop!');
                this.text('Select one option: ');
                const response = await this.select(['Goods', 'Potions']);

                switch (response) {
                    case 0: {
                        await npc.openShop(ShopIdEnum.GOODS);
                        break;
                    }
                    case 1: {
                        await npc.openShop(ShopIdEnum.POTIONS);
                        break;
                    }
                }
                break;
            }
        }
    }
}
