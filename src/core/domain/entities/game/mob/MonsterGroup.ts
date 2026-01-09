import SpawnConfig from '@/core/domain/entities/game/mob/spawn/SpawnConfig';
import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '../player/Player';

export default class MonsterGroup {
    private leader: Monster;
    private members: Array<Monster> = [];
    private spawnConfig: SpawnConfig;

    constructor({ spawnConfig }) {
        this.spawnConfig = spawnConfig;
    }

    getLeader() {
        return this.leader;
    }

    setMembers(value: Array<Monster>) {
        this.members = value;
    }

    getMembers() {
        return this.members;
    }

    setSpawnConfig(value: SpawnConfig) {
        this.spawnConfig = value;
    }

    getSpawnConfig() {
        return this.spawnConfig;
    }

    setLeader(leader: Monster) {
        this.addMember(leader);
        this.leader = leader;
    }

    addMember(monster: Monster) {
        this.members.push(monster);
        monster.setGroup(this);
    }

    hasAnyAlive(): boolean {
        for (const member of this.members) {
            if (!member.isDead()) return true;
        }
        return false;
    }

    allDead(): boolean {
        return !this.hasAnyAlive();
    }

    createRespawnEvent() {
        for (const member of this.members) {
            if (member.isDead()) {
                member.createRespawnEvent();
            }
        }
    }

    triggerAll(target: Player) {
        for (const member of this.members) {
            if (!member.getTarget()) {
                member.setTarget(target);
            }
        }
    }
}
