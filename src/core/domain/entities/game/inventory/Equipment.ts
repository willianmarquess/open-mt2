import { ItemEquipmentSlotEnum } from '../../../../enum/ItemEquipmentSlotEnum';
import { ItemWearFlagEnum } from '../../../../enum/ItemWearFlagEnum';
import Item from '../item/Item';

type ItemSlotInfo = {
    set: (value: Item) => void;
    get: () => Item;
};

export default class Equipment {
    private slots: Map<ItemEquipmentSlotEnum, ItemSlotInfo> = new Map<ItemEquipmentSlotEnum, ItemSlotInfo>();
    private weapon: Item;
    private head: Item;
    private body: Item;
    private foots: Item;
    private wrist: Item;
    private neck: Item;
    private ear: Item;
    private shield: Item;
    private arrow: Item;
    private unique1: Item;
    private unique2: Item;
    private ability1: Item;
    private ability2: Item;
    private ability3: Item;
    private ability4: Item;
    private ability5: Item;
    private ability6: Item;
    private ability7: Item;
    private ability8: Item;
    private costumeBody: Item;
    private costumeHair: Item;
    private ring1: Item;
    private ring2: Item;
    private belt: Item;

    private offset: number;

    constructor(offset: number) {
        this.offset = offset;
        this.slots.set(ItemEquipmentSlotEnum.BODY, {
            set: (value: Item) => {
                this.body = value;
            },
            get: () => this.body,
        });
        this.slots.set(ItemEquipmentSlotEnum.HEAD, {
            set: (value: Item) => {
                this.head = value;
            },
            get: () => this.head,
        });

        this.slots.set(ItemEquipmentSlotEnum.HEAD, {
            set: (value: Item) => {
                this.head = value;
            },
            get: () => this.head,
        });
        this.slots.set(ItemEquipmentSlotEnum.FOOTS, {
            set: (value: Item) => {
                this.foots = value;
            },
            get: () => this.foots,
        });
        this.slots.set(ItemEquipmentSlotEnum.WRIST, {
            set: (value: Item) => {
                this.wrist = value;
            },
            get: () => this.wrist,
        });
        this.slots.set(ItemEquipmentSlotEnum.WEAPON, {
            set: (value: Item) => {
                this.weapon = value;
            },
            get: () => this.weapon,
        });
        this.slots.set(ItemEquipmentSlotEnum.NECK, {
            set: (value: Item) => {
                this.neck = value;
            },
            get: () => this.neck,
        });
        this.slots.set(ItemEquipmentSlotEnum.EAR, {
            set: (value: Item) => {
                this.ear = value;
            },
            get: () => this.ear,
        });
        this.slots.set(ItemEquipmentSlotEnum.UNIQUE1, {
            set: (value: Item) => {
                this.unique1 = value;
            },
            get: () => this.unique1,
        });
        this.slots.set(ItemEquipmentSlotEnum.UNIQUE2, {
            set: (value: Item) => {
                this.unique2 = value;
            },
            get: () => this.unique2,
        });
        this.slots.set(ItemEquipmentSlotEnum.ARROW, {
            set: (value: Item) => {
                this.arrow = value;
            },
            get: () => this.arrow,
        });
        this.slots.set(ItemEquipmentSlotEnum.SHIELD, {
            set: (value: Item) => {
                this.shield = value;
            },
            get: () => this.shield,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY1, {
            set: (value: Item) => {
                this.ability1 = value;
            },
            get: () => this.ability1,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY2, {
            set: (value: Item) => {
                this.ability2 = value;
            },
            get: () => this.ability2,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY3, {
            set: (value: Item) => {
                this.ability3 = value;
            },
            get: () => this.ability3,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY4, {
            set: (value: Item) => {
                this.ability4 = value;
            },
            get: () => this.ability4,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY5, {
            set: (value: Item) => {
                this.ability5 = value;
            },
            get: () => this.ability5,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY6, {
            set: (value: Item) => {
                this.ability6 = value;
            },
            get: () => this.ability6,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY7, {
            set: (value: Item) => {
                this.ability7 = value;
            },
            get: () => this.ability7,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY8, {
            set: (value: Item) => {
                this.ability8 = value;
            },
            get: () => this.ability8,
        });
        this.slots.set(ItemEquipmentSlotEnum.COSTUME_BODY, {
            set: (value: Item) => {
                this.costumeBody = value;
            },
            get: () => this.costumeBody,
        });
        this.slots.set(ItemEquipmentSlotEnum.COSTUME_HAIR, {
            set: (value: Item) => {
                this.costumeHair = value;
            },
            get: () => this.costumeHair,
        });
        this.slots.set(ItemEquipmentSlotEnum.RING1, {
            set: (value: Item) => {
                this.ring1 = value;
            },
            get: () => this.ring1,
        });
        this.slots.set(ItemEquipmentSlotEnum.RING2, {
            set: (value: Item) => {
                this.ring2 = value;
            },
            get: () => this.ring2,
        });
        this.slots.set(ItemEquipmentSlotEnum.BELT, {
            set: (value: Item) => {
                this.belt = value;
            },
            get: () => this.belt,
        });
    }

    size() {
        return 24;
    }

    getWeapon() {
        return this.weapon;
    }
    getHead() {
        return this.head;
    }
    getBody() {
        return this.body;
    }
    getFoots() {
        return this.foots;
    }
    getWrist() {
        return this.wrist;
    }
    getNeck() {
        return this.neck;
    }
    getEar() {
        return this.ear;
    }
    getShield() {
        return this.shield;
    }
    getArrow() {
        return this.arrow;
    }
    getUnique1() {
        return this.unique1;
    }
    getUnique2() {
        return this.unique2;
    }
    getAbility1() {
        return this.ability1;
    }
    getAbility2() {
        return this.ability2;
    }
    getAbility3() {
        return this.ability3;
    }
    getAbility4() {
        return this.ability4;
    }
    getAbility5() {
        return this.ability5;
    }
    getAbility6() {
        return this.ability6;
    }
    getAbility7() {
        return this.ability7;
    }
    getAbility8() {
        return this.ability8;
    }
    getCostumeBody() {
        return this.costumeBody;
    }
    getCostumeHair() {
        return this.costumeHair;
    }
    getRing1() {
        return this.ring1;
    }
    getRing2() {
        return this.ring2;
    }
    getBelt() {
        return this.belt;
    }

    setItem(slot: ItemEquipmentSlotEnum, item: Item) {
        this.slots.get(slot - this.offset).set(item);
    }

    getItem(slot: ItemEquipmentSlotEnum) {
        return this.slots.get(slot - this.offset).get();
    }

    removeItem(slot: ItemEquipmentSlotEnum) {
        const item = this.getItem(slot);
        this.slots.get(slot - this.offset).set(null);
        return item;
    }

    haveAvailableSlot(slot: ItemEquipmentSlotEnum) {
        return !this.slots.get(slot - this.offset).get();
    }

    getWearPosition(item: Item) {
        switch (true) {
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_BODY):
                return this.offset + ItemEquipmentSlotEnum.BODY;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_HEAD):
                return this.offset + ItemEquipmentSlotEnum.HEAD;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_FOOTS):
                return this.offset + ItemEquipmentSlotEnum.FOOTS;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_EAR):
                return this.offset + ItemEquipmentSlotEnum.EAR;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_NECK):
                return this.offset + ItemEquipmentSlotEnum.NECK;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_SHIELD):
                return this.offset + ItemEquipmentSlotEnum.SHIELD;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_WEAPON):
                return this.offset + ItemEquipmentSlotEnum.WEAPON;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_ARROW):
                return this.offset + ItemEquipmentSlotEnum.ARROW;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_WRIST):
                return this.offset + ItemEquipmentSlotEnum.WRIST;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_ABILITY):
                return this.offset + ItemEquipmentSlotEnum.ABILITY1;
            case item.getWearFlags().is(ItemWearFlagEnum.WEAR_UNIQUE):
                return this.offset + ItemEquipmentSlotEnum.UNIQUE1;
        }
    }

    isValidSlot(item: Item, slot: ItemEquipmentSlotEnum) {
        switch (slot - this.offset) {
            case ItemEquipmentSlotEnum.BODY:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_BODY);
            case ItemEquipmentSlotEnum.HEAD:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_HEAD);
            case ItemEquipmentSlotEnum.FOOTS:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_FOOTS);
            case ItemEquipmentSlotEnum.WRIST:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_WRIST);
            case ItemEquipmentSlotEnum.WEAPON:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_WEAPON);
            case ItemEquipmentSlotEnum.NECK:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_NECK);
            case ItemEquipmentSlotEnum.EAR:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_EAR);
            case ItemEquipmentSlotEnum.SHIELD:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_SHIELD);
            case ItemEquipmentSlotEnum.UNIQUE1:
            case ItemEquipmentSlotEnum.UNIQUE2:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_UNIQUE);
            case ItemEquipmentSlotEnum.ARROW:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_ARROW);
            case ItemEquipmentSlotEnum.COSTUME_HAIR:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_HAIR);
            case ItemEquipmentSlotEnum.ABILITY1:
            case ItemEquipmentSlotEnum.ABILITY2:
            case ItemEquipmentSlotEnum.ABILITY3:
            case ItemEquipmentSlotEnum.ABILITY4:
            case ItemEquipmentSlotEnum.ABILITY5:
            case ItemEquipmentSlotEnum.ABILITY6:
            case ItemEquipmentSlotEnum.ABILITY7:
            case ItemEquipmentSlotEnum.ABILITY8:
                return item.getWearFlags().is(ItemWearFlagEnum.WEAR_ABILITY);
        }
    }
}
