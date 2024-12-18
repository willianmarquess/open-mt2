import { GameConfig } from "@/game/infra/config/GameConfig";
import Item from "@/core/domain/entities/game/item/Item";
import Monster from "@/core/domain/entities/game/mob/Monster";
import MathUtil from "@/core/domain/util/MathUtil";
import { MobRankEnum } from "@/core/enum/MobRankEnum";
import { ChatMessageTypeEnum } from "@/core/enum/ChatMessageTypeEnum";
import { SpecialItemEnum } from "@/core/enum/SpecialItemEnum";
import ItemManager from "./ItemManager";
import Player from "../entities/game/player/Player";

class DropItem {
    public item: Item;
    public count: number;

    constructor(item: Item, count: number) {
        this.item = item;
        this.count = count;
    }
}

export default class DropManager {
    private commonDrops = new Map();
    private config: GameConfig;
    private itemManager: ItemManager;

    constructor({ config, itemManager }) {
        this.config = config;
        this.itemManager = itemManager;
    }

    load() {
        Object.keys(this.config.commonDrops).forEach((rank) => {
            this.commonDrops.set(rank, this.config.commonDrops[rank]);
        });
    }

    getCommonDrops(player: Player, monster: Monster, delta: number, range: number) {
        const drops = [];
        const commonDrops = this.commonDrops.get(monster.getRank());

        if (!commonDrops) return drops;

        const possibleDrops = commonDrops.filter(
            (drop) => drop.minLevel <= player.getLevel() && drop.maxLevel >= player.getLevel(),
        );

        for (const drop of possibleDrops) {
            const percent = (drop.percentage * delta) / 100;
            const target = MathUtil.getRandomInt(1, range + 1);

            if (percent >= target) {
                const item = this.itemManager.getItem(drop.vnum);
                drops.push(new DropItem(item, 1));
            }
        }

        return drops;
    }

    getDefaultMonsterDrop(monster: Monster) {
        const drops = [];

        if (monster.getDropItem() > 0) {
            const item = this.itemManager.getItem(monster.getDropItem());
            drops.push(new DropItem(item, 1));
        }

        return drops;
    }

    calcDropPercent(player: Player, monster: Monster) {
        let delta = 0;
        let range = 0;
        const levelDelta = monster.getLevel() + 15 - player.getLevel();

        if (monster.getRank() === MobRankEnum.BOSS) {
            delta = this.config.dropDeltaBoss[MathUtil.minMax(0, levelDelta, this.config.dropDeltaBoss.length)];
        } else {
            delta = this.config.dropDeltaLevel[MathUtil.minMax(0, levelDelta, this.config.dropDeltaLevel.length)];
        }

        if (1 === MathUtil.getRandomInt(1, 50_000)) {
            delta += 1000;
        } else if (1 === MathUtil.getRandomInt(1, 10_000)) {
            delta += 500;
        }

        //TODO: impl premium types to increase this percent
        //TODO: verify premium items are equipped like (gloves)

        if (player.getMallItemBonus() > 0) {
            delta += (delta * player.getMallItemBonus()) / 100;
        }

        const itemDropBonus = Math.min(100, player.getItemDropBonus());
        const empireDropBonus = 10000; //TODO

        range = 4_000_000;
        range = (range * 100) / (100 + empireDropBonus + itemDropBonus);

        return {
            delta,
            range,
        };
    }

    getGoldDrop(player: Player, monster: Monster) {
        const goldPercent = this.config.dropGoldByRank[monster.getRank()] || this.config.dropGoldByRank[MobRankEnum.PAWN];
        let percent = 0;
        let goldMult = 1;
        const levelDelta = monster.getLevel() + 15 - player.getLevel();

        //TODO: verify special item and premium stats
        if (monster.getRank() === MobRankEnum.BOSS) {
            percent =
                (goldPercent *
                    this.config.dropDeltaBoss[MathUtil.minMax(0, levelDelta, this.config.dropDeltaBoss.length)]) /
                100;
        } else {
            percent =
                (goldPercent *
                    this.config.dropDeltaLevel[MathUtil.minMax(0, levelDelta, this.config.dropDeltaLevel.length)]) /
                100;
        }

        percent = Math.max(100, percent);

        if (MathUtil.getRandomInt(1, 100) > percent) return;

        const capToMultGoldBy50 = 50_000;
        const percentToMultGoldBy50 = this.config.PERCENT_TO_MULT_GOLD_BY_50;
        const capToMultGoldBy10 = 10_000;
        const percentToMultGoldBy10 = this.config.PERCENT_TO_MULT_GOLD_BY_10;
        const capToMultGoldBy5 = 5_000;
        const percentToMultGoldBy5 = this.config.PERCENT_TO_MULT_GOLD_BY_5;

        switch (true) {
            case (capToMultGoldBy50 / 100) * percentToMultGoldBy50 >= MathUtil.getRandomInt(1, capToMultGoldBy50): {
                goldMult += 50;
                break;
            }
            case (capToMultGoldBy10 / 100) * percentToMultGoldBy10 >= MathUtil.getRandomInt(1, capToMultGoldBy10): {
                goldMult += 10;
                break;
            }
            case (capToMultGoldBy5 / 100) * percentToMultGoldBy5 >= MathUtil.getRandomInt(1, capToMultGoldBy5): {
                goldMult += 5;
                break;
            }
        }

        let gold = MathUtil.getRandomInt(monster.getGoldMin(), monster.getGoldMax());

        if (goldMult > 1) {
            player.chat({
                message: `You received gold multiplied by ${goldMult - 1}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
        }

        gold *= goldMult;

        const item = this.itemManager.getItem(SpecialItemEnum.GOLD);
        return new DropItem(item, gold);
    }

    getDrops(player: Player, monster: Monster) {
        const drops = [];

        const { delta, range } = this.calcDropPercent(player, monster);

        drops.push(...this.getCommonDrops(player, monster, delta, range));
        drops.push(...this.getDefaultMonsterDrop(monster));
        drops.push(this.getGoldDrop(player, monster));

        return drops;
    }
}
