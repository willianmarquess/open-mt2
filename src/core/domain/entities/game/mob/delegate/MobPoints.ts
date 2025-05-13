import { PointsEnum } from '@/core/enum/PointsEnum';
import { Points } from '../../shared/Points';
import MathUtil from '@/core/domain/util/MathUtil';
import { MobsProto } from '@/game/infra/config/GameConfig';

export class MobPoints extends Points {
    private mobProto: MobsProto;
    private attack: number;
    private defense: number;
    private health: number;

    constructor(mobProto: MobsProto) {
        super();
        this.mobProto = mobProto;

        this.points.set(PointsEnum.MOVE_SPEED, {
            get: () => Number(this.mobProto.move_speed),
        });
        this.points.set(PointsEnum.ATTACK_SPEED, {
            get: () => Number(this.mobProto.attack_speed),
        });
        this.points.set(PointsEnum.DX, {
            get: () => Number(this.mobProto.dx),
        });
        this.points.set(PointsEnum.HT, {
            get: () => Number(this.mobProto.ht),
        });
        this.points.set(PointsEnum.IQ, {
            get: () => Number(this.mobProto.iq),
        });
        this.points.set(PointsEnum.ST, {
            get: () => Number(this.mobProto.st),
        });
        this.points.set(PointsEnum.LEVEL, {
            get: () => Number(this.mobProto.level),
        });
        this.points.set(PointsEnum.MAX_HEALTH, {
            get: () => Number(this.mobProto.max_hp),
        });
        this.points.set(PointsEnum.DEFENSE, {
            get: () => this.defense,
        });
        this.points.set(PointsEnum.ATTACK_GRADE, {
            get: () => this.attack,
        });
        this.points.set(PointsEnum.HEALTH, {
            get: () => this.health,
            add: (value: number) => this.addHealth(value),
        });
    }

    public calcPoints() {
        this.calcDefense();
        this.calcAttack();
        this.calcHealth();
    }

    public calcPointsAndResetValues(): void {
        this.calcDefense();
        this.calcAttack();
        this.calcHealth();
    }

    private calcDefense() {
        this.defense = Math.floor(
            this.getPoint(PointsEnum.LEVEL) * 3 + this.getPoint(PointsEnum.HT) * 4 + Number(this.mobProto.def),
        );
    }

    private calcAttack() {
        this.attack =
            (MathUtil.getRandomInt(Number(this.mobProto.damage_min), Number(this.mobProto.damage_max)) +
                Math.floor(this.getPoint(PointsEnum.LEVEL) * 3 + this.getPoint(PointsEnum.ST) * 4)) *
            Number(this.mobProto.dam_multiply);
    }

    private calcHealth() {
        this.health = Number(this.mobProto.max_hp);
    }

    addHealth(value: number) {
        this.health = Math.max(0, Math.min(this.health + value, Number(this.mobProto.max_hp)));
    }
}
