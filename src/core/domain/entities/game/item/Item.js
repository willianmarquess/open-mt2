export default class Item {
    #id;
    #name;
    #type;
    #subType;
    #size;
    #antiFlags;
    #flags;
    #wearFlags;
    #immuneFlags;
    #gold;
    #shopPrice;
    #refineId;
    #refineSet;
    #magicPercent;
    #limits = [];
    #applies = [];
    #values = [];
    #specular;
    #socket;
    #addon;

    constructor({
        id,
        name,
        type,
        subType,
        size,
        antiFlags,
        flags,
        wearFlags,
        immuneFlags,
        gold,
        shopPrice,
        refineId,
        refineSet,
        magicPercent,
        limits,
        applies,
        values,
        specular,
        socket,
        addon,
    }) {
        this.#id = id;
        this.#name = name;
        this.#type = type;
        this.#subType = subType;
        this.#size = size;
        this.#antiFlags = antiFlags;
        this.#flags = flags;
        this.#wearFlags = wearFlags;
        this.#immuneFlags = immuneFlags;
        this.#gold = gold;
        this.#shopPrice = shopPrice;
        this.#refineId = refineId;
        this.#refineSet = refineSet;
        this.#magicPercent = magicPercent;
        this.#limits = limits;
        this.#applies = applies;
        this.#values = values;
        this.#specular = specular;
        this.#socket = socket;
        this.#addon = addon;
    }

    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get subType() {
        return this.#subType;
    }
    get size() {
        return this.#size;
    }
    get antiFlags() {
        return this.#antiFlags;
    }
    get flags() {
        return this.#flags;
    }
    get wearFlags() {
        return this.#wearFlags;
    }
    get immuneFlags() {
        return this.#immuneFlags;
    }
    get gold() {
        return this.#gold;
    }
    get shopPrice() {
        return this.#shopPrice;
    }
    get refineId() {
        return this.#refineId;
    }
    get refineSet() {
        return this.#refineSet;
    }
    get magicPercent() {
        return this.#magicPercent;
    }
    get limits() {
        return this.#limits;
    }
    get applies() {
        return this.#applies;
    }
    get values() {
        return this.#values;
    }
    get specular() {
        return this.#specular;
    }
    get socket() {
        return this.#socket;
    }
    get addon() {
        return this.#addon;
    }
}
