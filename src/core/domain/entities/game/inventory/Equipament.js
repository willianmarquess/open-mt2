import ItemEquipamentSlotEnum from '../../../../enum/ItemEquipamentSlotEnum.js';
import ItemWearFlagEnum from '../../../../enum/ItemWearFlagEnum.js';

export default class Equipament {
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
    #custumeBody;
    #custumeHair;
    #ring1;
    #ring2;
    #belt;

    #offset;

    constructor(offset) {
        this.#offset = offset;
        this.#slots = {
            [ItemEquipamentSlotEnum.BODY]: {
                set: (value) => {
                    this.#body = value;
                },
                get: () => this.#body,
            },
            [ItemEquipamentSlotEnum.HEAD]: {
                set: (value) => {
                    this.#head = value;
                },
                get: () => this.#head,
            },
            [ItemEquipamentSlotEnum.FOOTS]: {
                set: (value) => {
                    this.#foots = value;
                },
                get: () => this.#foots,
            },
            [ItemEquipamentSlotEnum.WRIST]: {
                set: (value) => {
                    this.#wrist = value;
                },
                get: () => this.#wrist,
            },
            [ItemEquipamentSlotEnum.WEAPON]: {
                set: (value) => {
                    this.#weapon = value;
                },
                get: () => this.#weapon,
            },
            [ItemEquipamentSlotEnum.NECK]: {
                set: (value) => {
                    this.#neck = value;
                },
                get: () => this.#neck,
            },
            [ItemEquipamentSlotEnum.EAR]: {
                set: (value) => {
                    this.#ear = value;
                },
                get: () => this.#ear,
            },
            [ItemEquipamentSlotEnum.UNIQUE1]: {
                set: (value) => {
                    this.#unique1 = value;
                },
                get: () => this.#unique1,
            },
            [ItemEquipamentSlotEnum.UNIQUE2]: {
                set: (value) => {
                    this.#unique2 = value;
                },
                get: () => this.#unique2,
            },
            [ItemEquipamentSlotEnum.ARROW]: {
                set: (value) => {
                    this.#arrow = value;
                },
                get: () => this.#arrow,
            },
            [ItemEquipamentSlotEnum.SHIELD]: {
                set: (value) => {
                    this.#shield = value;
                },
                get: () => this.#shield,
            },
            [ItemEquipamentSlotEnum.ABILITY1]: {
                set: (value) => {
                    this.#ability1 = value;
                },
                get: () => this.#ability1,
            },
            [ItemEquipamentSlotEnum.ABILITY2]: {
                set: (value) => {
                    this.#ability2 = value;
                },
                get: () => this.#ability2,
            },
            [ItemEquipamentSlotEnum.ABILITY3]: {
                set: (value) => {
                    this.#ability3 = value;
                },
                get: () => this.#ability3,
            },
            [ItemEquipamentSlotEnum.ABILITY4]: {
                set: (value) => {
                    this.#ability4 = value;
                },
                get: () => this.#ability4,
            },
            [ItemEquipamentSlotEnum.ABILITY5]: {
                set: (value) => {
                    this.#ability5 = value;
                },
                get: () => this.#ability5,
            },
            [ItemEquipamentSlotEnum.ABILITY6]: {
                set: (value) => {
                    this.#ability6 = value;
                },
                get: () => this.#ability6,
            },
            [ItemEquipamentSlotEnum.ABILITY7]: {
                set: (value) => {
                    this.#ability7 = value;
                },
                get: () => this.#ability7,
            },
            [ItemEquipamentSlotEnum.ABILITY8]: {
                set: (value) => {
                    this.#ability8 = value;
                },
                get: () => this.#ability8,
            },
            [ItemEquipamentSlotEnum.COSTUME_BODY]: {
                set: (value) => {
                    this.#custumeBody = value;
                },
                get: () => this.#custumeBody,
            },
            [ItemEquipamentSlotEnum.COSTUME_HAIR]: {
                set: (value) => {
                    this.#custumeHair = value;
                },
                get: () => this.#custumeHair,
            },
            [ItemEquipamentSlotEnum.RING1]: {
                set: (value) => {
                    this.#ring1 = value;
                },
                get: () => this.#ring1,
            },
            [ItemEquipamentSlotEnum.RING2]: {
                set: (value) => {
                    this.#ring2 = value;
                },
                get: () => this.#ring2,
            },
            [ItemEquipamentSlotEnum.BELT]: {
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
        return this.#custumeBody;
    }
    get custumeHair() {
        return this.#custumeHair;
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
                return this.#offset + ItemEquipamentSlotEnum.BODY;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_HEAD):
                return this.#offset + ItemEquipamentSlotEnum.HEAD;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_FOOTS):
                return this.#offset + ItemEquipamentSlotEnum.FOOTS;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_EAR):
                return this.#offset + ItemEquipamentSlotEnum.EAR;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_NECK):
                return this.#offset + ItemEquipamentSlotEnum.NECK;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_SHIELD):
                return this.#offset + ItemEquipamentSlotEnum.SHIELD;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_WEAPON):
                return this.#offset + ItemEquipamentSlotEnum.WEAPON;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_ARROW):
                return this.#offset + ItemEquipamentSlotEnum.ARROW;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_WRIST):
                return this.#offset + ItemEquipamentSlotEnum.WRIST;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_ABILITY):
                return this.#offset + ItemEquipamentSlotEnum.ABILITY1;
            case item.wearFlags.is(ItemWearFlagEnum.WEAR_UNIQUE):
                return this.#offset + ItemEquipamentSlotEnum.UNIQUE1;
        }
    }

    isValidSlot(item, slot) {
        switch (slot - this.#offset) {
            case ItemEquipamentSlotEnum.BODY:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_BODY);
            case ItemEquipamentSlotEnum.HEAD:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_HEAD);
            case ItemEquipamentSlotEnum.FOOTS:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_FOOTS);
            case ItemEquipamentSlotEnum.WRIST:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_WRIST);
            case ItemEquipamentSlotEnum.WEAPON:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_WEAPON);
            case ItemEquipamentSlotEnum.NECK:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_NECK);
            case ItemEquipamentSlotEnum.EAR:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_EAR);
            case ItemEquipamentSlotEnum.SHIELD:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_SHIELD);
            case ItemEquipamentSlotEnum.UNIQUE1:
            case ItemEquipamentSlotEnum.UNIQUE2:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_UNIQUE);
            case ItemEquipamentSlotEnum.ARROW:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_ARROW);
            case ItemEquipamentSlotEnum.COSTUME_HAIR:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_HAIR);
            case ItemEquipamentSlotEnum.ABILITY1:
            case ItemEquipamentSlotEnum.ABILITY2:
            case ItemEquipamentSlotEnum.ABILITY3:
            case ItemEquipamentSlotEnum.ABILITY4:
            case ItemEquipamentSlotEnum.ABILITY5:
            case ItemEquipamentSlotEnum.ABILITY6:
            case ItemEquipamentSlotEnum.ABILITY7:
            case ItemEquipamentSlotEnum.ABILITY8:
                return item.wearFlags.is(ItemWearFlagEnum.WEAR_ABILITY);
        }
    }
}
