export default class MonsterGroup {
    #leader;
    #members = [];
    #vnum;

    constructor({ vnum, leader }) {
        this.#leader = leader;
        this.#vnum = vnum;
        this.addMember(leader);
    }

    set leader(value) {
        this.#leader = value;
    }

    get leader() {
        return this.#leader;
    }

    set members(value) {
        this.#members = value;
    }

    get members() {
        return this.#members;
    }

    set vnum(value) {
        this.#vnum = value;
    }

    get vnum() {
        return this.#vnum;
    }

    addMember(monster) {
        this.#members.push(monster);
        monster.group = this;
    }
}
