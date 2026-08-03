import { expect } from 'chai';
import BitFlag from '@/core/util/BitFlag';
import Item from '@/core/domain/entities/game/item/Item';
import Logger from '@/core/infra/logger/Logger';
import { PlayerFactory } from '@/core/domain/factories/PlayerFactory';
import { ItemFlagEnum } from '@/core/enum/ItemFlagEnum';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemUseSubTypeEnum } from '@/core/enum/ItemUseSubTypeEnum';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} };

const POTION_VNUM = 27001;

const createPlayer = () => {
    const config: any = {
        INVENTORY_PAGES: 2,
        empire: { red: { startPosX: 0, startPosY: 0 } },
        jobs: {
            warrior: {
                common: {
                    st: 10,
                    ht: 10,
                    dx: 10,
                    iq: 10,
                    initialHp: 1_000,
                    initialMp: 500,
                    initialStamina: 30,
                    hpPerLvl: 0,
                    hpPerHtPoint: 0,
                    mpPerLvl: 0,
                    mpPerIqPoint: 0,
                    initialAttackSpeed: 100,
                    initialMovementSpeed: 100,
                },
            },
        },
    };

    const player = PlayerFactory.create(
        {
            playerClass: 0,
            accountId: 1,
            appearance: 1,
            slot: 0,
            virtualId: 1,
            id: 1,
            empire: 1,
            skillGroup: 0,
            playTime: 0,
            level: 1,
            experience: 0,
            gold: 0,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            positionX: 100_000,
            positionY: 100_000,
            health: 1,
            mana: 1,
            stamina: 30,
            bodyPart: 0,
            hairPart: 0,
            name: 'seller',
            givenStatusPoints: 0,
            availableStatusPoints: 0,
        } as any,
        {
            config,
            animationManager: { getAnimation: () => undefined } as any,
            experienceManager: { getNeededExperience: () => 100 } as any,
            logger,
            saveCharacterService: {} as any,
            questManager: {} as any,
            eventTimerManager: {} as any,
            mobManager: {} as any,
        },
    );

    player.setConnection({ send: () => {} } as any);

    return player;
};

const createPotion = (dbId: number, count: number) =>
    new Item({
        id: POTION_VNUM,
        name: 'potion',
        type: ItemTypeEnum.ITEM_USE,
        subType: ItemUseSubTypeEnum.USE_POTION,
        size: 1,
        antiFlags: new BitFlag(),
        flags: new BitFlag(ItemFlagEnum.ITEM_STACKABLE),
        wearFlags: new BitFlag(),
        immuneFlags: new BitFlag(),
        gold: 0,
        shopPrice: 100,
        refineId: 0,
        refineSet: 0,
        magicPercent: 0,
        limits: [],
        applies: [],
        values: [],
        specular: 0,
        socket: 0,
        addon: 0,
        count,
        socket0: 0,
        socket1: 0,
        socket2: 0,
        attributeType0: 0,
        attributeValue0: 0,
        attributeType1: 0,
        attributeValue1: 0,
        attributeType2: 0,
        attributeValue2: 0,
        attributeType3: 0,
        attributeValue3: 0,
        attributeType4: 0,
        attributeValue4: 0,
        attributeType5: 0,
        attributeValue5: 0,
        attributeType6: 0,
        attributeValue6: 0,
        dbId,
    } as any);

describe('Player stack merging into a private shop listing (issue #128)', () => {
    it('should leave a listed stack untouched and place the new units elsewhere', () => {
        const player = createPlayer();
        const listed = createPotion(1, 5);
        player.getInventory().addItem(listed);
        (player as any).privateShop = { hasItemListed: (item: Item) => item === listed };

        const picked = createPotion(2, 10);
        const result = player.addItemStacking(picked);

        expect(listed.getCount()).to.be.equal(5);
        expect(picked.getCount()).to.be.equal(10);
        expect(result?.inserted).to.be.equal(picked);
    });

    it('should still merge into a stack that is not for sale', () => {
        const player = createPlayer();
        const existing = createPotion(1, 5);
        player.getInventory().addItem(existing);

        const picked = createPotion(2, 10);
        const result = player.addItemStacking(picked);

        expect(existing.getCount()).to.be.equal(15);
        expect(picked.getCount()).to.be.equal(0);
        expect(result?.inserted).to.be.equal(null);
    });
});
