import SpawnConfig from '@/core/domain/entities/game/mob/spawn/SpawnConfig';
import { Mob } from '@/core/domain/entities/game/mob/Mob';

export default class MonsterGroup {
    private leader: Mob;
    private members: Array<Mob> = [];
    private spawnConfig: SpawnConfig;

    constructor({ spawnConfig }) {
        this.spawnConfig = spawnConfig;
    }

    getLeader() {
        return this.leader;
    }

    setMembers(value: Array<Mob>) {
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

    setLeader(leader: Mob) {
        this.addMember(leader);
        this.leader = leader;
    }

    addMember(monster: Mob) {
        this.members.push(monster);
        monster.setGroup(this);
    }
}
