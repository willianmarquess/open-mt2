export default class MonsterGroup {
    #leader;
    #members = [];
    #spawnConfig;

    constructor({ spawnConfig }) {
        this.#spawnConfig = spawnConfig;
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

    set spawnConfig(value) {
        this.#spawnConfig = value;
    }

    get spawnConfig() {
        return this.#spawnConfig;
    }

    setLeader(leader) {
        this.addMember(leader);
        this.#leader = leader;
    }

    addMember(monster) {
        this.#members.push(monster);
        monster.group = this;
    }
}
