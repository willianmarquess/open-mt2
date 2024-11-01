import ItemEquipmentSlotEnum from '../../../../enum/ItemEquipmentSlotEnum.js';
import ItemWearFlagEnum from '../../../../enum/ItemWearFlagEnum.js';

export default class Equipment {
    #slots;

    #weapon;
    #head;
    #body;
    #foots;
    #wrist;
    #neck;
    #ear;
    #shield;
    #arrow;
    #unique1;
    #unique2;
    #ability1;
    #ability2;
    #ability3;
    #ability4;
    #ability5;
    #ability6;
    #ability7;
    #ability8;
    #costumeBody;
    #costumeHair;
    #ring1;
    #ring2;
    #belt;

    #offset;

    constructor(offset) {
        this.#offset = offset;
        this.#slots = {
            [ItemEquipmentSlotEnum.BODY]: {
                set: (value) => {
                    this.#body = value;
                },
                get: () => this.#body,
            },
            [ItemEquipmentSlotEnum.HEAD]: {
                set: (value) => {
                    this.#head = value;
                },
                get: () => this.#head,
            },
            [ItemEquipmentSlotEnum.FOOTS]: {
                set: (value) => {
                    this.#foots = value;
                },
                get: () => this.#foots,
            },
            [ItemEquipmentSlotEnum.WRIST]: {
                set: (value) => {
                    this.#wrist = value;
                },
                get: () => this.#wrist,
            },
            [ItemEquipmentSlotEnum.WEAPON]: {
                set: (value) => {
                    this.#weapon = value;
                },
                get: () => this.#weapon,
            },
            [ItemEquipmentSlotEnum.NECK]: {
                set: (value) => {
                    this.#neck = value;
                },
                get: () => this.#neck,
            },
            [ItemEquipmentSlotEnum.EAR]: {
                set: (value) => {
                    this.#ear = value;
                },
                get: () => this.#ear,
            },
            [ItemEquipmentSlotEnum.UNIQUE1]: {
                set: (value) => {
                    this.#unique1 = value;
                },
                get: () => this.#unique1,
            },
            [ItemEquipmentSlotEnum.UNIQUE2]: {
                set: (value) => {
                    this.#unique2 = value;
                },
                get: () => this.#unique2,
            },
            [ItemEquipmentSlotEnum.ARROW]: {
                set: (value) => {
                    this.#arrow = value;
                },
                get: () => this.#arrow,
            },
            [ItemEquipmentSlotEnum.SHIELD]: {
                set: (value) => {
                    this.#shield = value;
                },
                get: () => this.#shield,
            },
            [ItemEquipmentSlotEnum.ABILITY1]: {
                set: (value) => {
                    this.#ability1 = value;
                },
                get: () => this.#ability1,
            },
            [ItemEquipmentSlotEnum.ABILITY2]: {
                set: (value) => {
                    this.#ability2 = value;
                },
                get: () => this.#ability2,
            },
            [ItemEquipmentSlotEnum.ABILITY3]: {
                set: (value) => {
                    this.#ability3 = value;
                },
                get: () => this.#ability3,
            },
            [ItemEquipmentSlotEnum.ABILITY4]: {
                set: (value) => {
                    this.#ability4 = value;
                },
                get: () => this.#ability4,
            },
            [ItemEquipmentSlotEnum.ABILITY5]: {
                set: (value) => {
                    this.#ability5 = value;
                },
                get: () => this.#ability5,
            },
            [ItemEquipmentSlotEnum.ABILITY6]: {
                set: (value) => {
                    this.#ability6 = value;
                },
                get: () => this.#ability6,
            },
            [ItemEquipmentSlotEnum.ABILITY7]: {
                set: (value) => {
                    this.#ability7 = value;
                },
                get: () => this.#ability7,
            },
            [ItemEquipmentSlotEnum.ABILITY8]: {
                set: (value) => {
                    this.#ability8 = value;
                },
                get: () => this.#ability8,
            },
            [ItemEquipmentSlotEnum.COSTUME_BODY]: {
                set: (value) => {
                    this.#costumeBody = value;
                },
                get: () => this.#costumeBody,
            },
            [ItemEquipmentSlotEnum.COSTUME_HAIR]: {
                set: (value) => {
                    this.#costumeHair = value;
                },
                get: () => this.#costumeHair,
            },
            [ItemEquipmentSlotEnum.RING1]: {
                set: (value) => {
                    this.#ring1 = value;
                },
                get: () => this.#ring1,
            },
            [ItemEquipmentSlotEnum.RING2]: {
                set: (value) => {
                    this.#ring2 = value;
                },
                get: () => this.#ring2,
            },
            [ItemEquipmentSlotEnum.BELT]: {
                set: (value) => {
                    this.#belt = value;
                },
                get: () => this.#belt,
            },
        };
    }

    size() {
        return 24;
    }

    get weapon() {
        return this.#weapon;
    }
    get head() {
        return this.#head;
    }
    get body() {
        return this.#body;
    }
    get foots() {
        return this.#foots;
    }
    get wrist() {
        return this.#wrist;
    }
    get neck() {
        return this.#neck;
    }
    get ear() {
        return this.#ear;
    }
    get shield() {
        return this.#shield;
    }
    get arrow() {
        return this.#arrow;
    }
    get unique1() {
        return this.#unique1;
    }
    get unique2() {
        return this.#unique2;
    }
    get ability1() {
        return this.#ability1;
    }
    get ability2() {
        return this.#ability2;
    }
    get ability3() {
        return this.#ability3;
    }
    get ability4() {
        return this.#ability4;
    }
    get ability5() {
        return this.#ability5;
    }
    get ability6() {
        return this.#ability6;
    }
    get ability7() {
        return this.#ability7;
    }
    get ability8() {
        return this.#ability8;
    }
    get custumeBody() {
        return this.#costumeBody;
    }
    get custumeHair() {
        return this.#costumeHair;
    }
    get ring1() {
        return this.#ring1;
    }
    get ring2() {
        return this.#ring2;
    }
    get belt() {
        return this.#belt;
    }

    setItem(slot, item) {
        this.#slots[slot - this.#offset]?.set(item);
    }

    getItem(slot) {
        return this.#slots[slot - this.#offset]?.get();
    }

    removeItem(slot) {
        const item = this.getItem(slot);
        this.#slots[slot - this.#offset]?.set(null);
        return item;
    }

    haveAvailableSlot(slot) {
        return !this.#slots[slot - this.#offset]?.get();
    }

    getWearPosition(item) {
        switch (true) {
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_BODY):
                return this.#offset + ItemEquipmentSlotEnum.BODY;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_HEAD):
                return this.#offset + ItemEquipmentSlotEnum.HEAD;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_FOOTS):
                return this.#offset + ItemEquipmentSlotEnum.FOOTS;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_EAR):
                return this.#offset + ItemEquipmentSlotEnum.EAR;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_NECK):
                return this.#offset + ItemEquipmentSlotEnum.NECK;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_SHIELD):
                return this.#offset + ItemEquipmentSlotEnum.SHIELD;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_WEAPON):
                return this.#offset + ItemEquipmentSlotEnum.WEAPON;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_ARROW):
                return this.#offset + ItemEquipmentSlotEnum.ARROW;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_WRIST):
                return this.#offset + ItemEquipmentSlotEnum.WRIST;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_ABILITY):
                return this.#offset + ItemEquipmentSlotEnum.ABILITY1;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_UNIQUE):
                return this.#offset + ItemEquipmentSlotEnum.UNIQUE1;
        }
    }

    isValidSlot(item, slot) {
        switch (slot - this.#offset) {
            case ItemEquipmentSlotEnum.BODY:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_BODY);
            case ItemEquipmentSlotEnum.HEAD:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_HEAD);
            case ItemEquipmentSlotEnum.FOOTS:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_FOOTS);
            case ItemEquipmentSlotEnum.WRIST:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_WRIST);
            case ItemEquipmentSlotEnum.WEAPON:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_WEAPON);
            case ItemEquipmentSlotEnum.NECK:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_NECK);
            case ItemEquipmentSlotEnum.EAR:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_EAR);
            case ItemEquipmentSlotEnum.SHIELD:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_SHIELD);
            case ItemEquipmentSlotEnum.UNIQUE1:
            case ItemEquipmentSlotEnum.UNIQUE2:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_UNIQUE);
            case ItemEquipmentSlotEnum.ARROW:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_ARROW);
            case ItemEquipmentSlotEnum.COSTUME_HAIR:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_HAIR);
            case ItemEquipmentSlotEnum.ABILITY1:
            case ItemEquipmentSlotEnum.ABILITY2:
            case ItemEquipmentSlotEnum.ABILITY3:
            case ItemEquipmentSlotEnum.ABILITY4:
            case ItemEquipmentSlotEnum.ABILITY5:
            case ItemEquipmentSlotEnum.ABILITY6:
            case ItemEquipmentSlotEnum.ABILITY7:
            case ItemEquipmentSlotEnum.ABILITY8:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_ABILITY);
        }
    }
}
