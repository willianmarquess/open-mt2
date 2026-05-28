import { ItemEquipmentSlotEnum } from '../../../../enum/ItemEquipmentSlotEnum';
import { ItemWearFlagEnum } from '../../../../enum/ItemWearFlagEnum';
import Item from '../item/Item';

type ItemSlotInfo = {
    set: (value: Item | null) => void;
    get: () => Item | null;
};

export default class Equipment {
    private readonly slots: Map<ItemEquipmentSlotEnum, ItemSlotInfo> = new Map<ItemEquipmentSlotEnum, ItemSlotInfo>();
    private weapon: Item | null = null;
    private head: Item | null = null;
    private body: Item | null = null;
    private foots: Item | null = null;
    private wrist: Item | null = null;
    private neck: Item | null = null;
    private ear: Item | null = null;
    private shield: Item | null = null;
    private arrow: Item | null = null;
    private unique1: Item | null = null;
    private unique2: Item | null = null;
    private ability1: Item | null = null;
    private ability2: Item | null = null;
    private ability3: Item | null = null;
    private ability4: Item | null = null;
    private ability5: Item | null = null;
    private ability6: Item | null = null;
    private ability7: Item | null = null;
    private ability8: Item | null = null;
    private costumeBody: Item | null = null;
    private costumeHair: Item | null = null;
    private ring1: Item | null = null;
    private ring2: Item | null = null;
    private belt: Item | null = null;

    private readonly offset: number;

    constructor(offset: number) {
        this.offset = offset;
        this.slots.set(ItemEquipmentSlotEnum.BODY, {
            set: (value: Item | null) => {
                this.body = value;
            },
            get: () => this.body,
        });
        this.slots.set(ItemEquipmentSlotEnum.HEAD, {
            set: (value: Item | null) => {
                this.head = value;
            },
            get: () => this.head,
        });

        this.slots.set(ItemEquipmentSlotEnum.HEAD, {
            set: (value: Item | null) => {
                this.head = value;
            },
            get: () => this.head,
        });
        this.slots.set(ItemEquipmentSlotEnum.FOOTS, {
            set: (value: Item | null) => {
                this.foots = value;
            },
            get: () => this.foots,
        });
        this.slots.set(ItemEquipmentSlotEnum.WRIST, {
            set: (value: Item | null) => {
                this.wrist = value;
            },
            get: () => this.wrist,
        });
        this.slots.set(ItemEquipmentSlotEnum.WEAPON, {
            set: (value: Item | null) => {
                this.weapon = value;
            },
            get: () => this.weapon,
        });
        this.slots.set(ItemEquipmentSlotEnum.NECK, {
            set: (value: Item | null) => {
                this.neck = value;
            },
            get: () => this.neck,
        });
        this.slots.set(ItemEquipmentSlotEnum.EAR, {
            set: (value: Item | null) => {
                this.ear = value;
            },
            get: () => this.ear,
        });
        this.slots.set(ItemEquipmentSlotEnum.UNIQUE1, {
            set: (value: Item | null) => {
                this.unique1 = value;
            },
            get: () => this.unique1,
        });
        this.slots.set(ItemEquipmentSlotEnum.UNIQUE2, {
            set: (value: Item | null) => {
                this.unique2 = value;
            },
            get: () => this.unique2,
        });
        this.slots.set(ItemEquipmentSlotEnum.ARROW, {
            set: (value: Item | null) => {
                this.arrow = value;
            },
            get: () => this.arrow,
        });
        this.slots.set(ItemEquipmentSlotEnum.SHIELD, {
            set: (value: Item | null) => {
                this.shield = value;
            },
            get: () => this.shield,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY1, {
            set: (value: Item | null) => {
                this.ability1 = value;
            },
            get: () => this.ability1,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY2, {
            set: (value: Item | null) => {
                this.ability2 = value;
            },
            get: () => this.ability2,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY3, {
            set: (value: Item | null) => {
                this.ability3 = value;
            },
            get: () => this.ability3,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY4, {
            set: (value: Item | null) => {
                this.ability4 = value;
            },
            get: () => this.ability4,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY5, {
            set: (value: Item | null) => {
                this.ability5 = value;
            },
            get: () => this.ability5,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY6, {
            set: (value: Item | null) => {
                this.ability6 = value;
            },
            get: () => this.ability6,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY7, {
            set: (value: Item | null) => {
                this.ability7 = value;
            },
            get: () => this.ability7,
        });
        this.slots.set(ItemEquipmentSlotEnum.ABILITY8, {
            set: (value: Item | null) => {
                this.ability8 = value;
            },
            get: () => this.ability8,
        });
        this.slots.set(ItemEquipmentSlotEnum.COSTUME_BODY, {
            set: (value: Item | null) => {
                this.costumeBody = value;
            },
            get: () => this.costumeBody,
        });
        this.slots.set(ItemEquipmentSlotEnum.COSTUME_HAIR, {
            set: (value: Item | null) => {
                this.costumeHair = value;
            },
            get: () => this.costumeHair,
        });
        this.slots.set(ItemEquipmentSlotEnum.RING1, {
            set: (value: Item | null) => {
                this.ring1 = value;
            },
            get: () => this.ring1,
        });
        this.slots.set(ItemEquipmentSlotEnum.RING2, {
            set: (value: Item | null) => {
                this.ring2 = value;
            },
            get: () => this.ring2,
        });
        this.slots.set(ItemEquipmentSlotEnum.BELT, {
            set: (value: Item | null) => {
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
        const slotEntry = this.slots.get(slot - this.offset);
        if (slotEntry) {
            slotEntry.set(item);
        }
    }

    getItem(slot: ItemEquipmentSlotEnum) {
        const slotEntry = this.slots.get(slot - this.offset);
        return slotEntry ? slotEntry.get() : null;
    }

    removeItem(slot: ItemEquipmentSlotEnum) {
        const item = this.getItem(slot);
        const slotEntry = this.slots.get(slot - this.offset);
        if (slotEntry) {
            slotEntry.set(null);
        }
        return item;
    }

    haveAvailableSlot(slot: ItemEquipmentSlotEnum) {
        return !this.slots.get(slot - this.offset)?.get();
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
