import Logger from '@/core/infra/logger/Logger';
import Player from '../Player';
import GameEntity from '../../GameEntity';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import MathUtil from '@/core/domain/util/MathUtil';
import { ItemTypeEnum } from '@/core/enum/ItemTypeEnum';
import { ItemSubTypeEnum } from '@/core/enum/ItemSubTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

export default class PlayerBattle {
    private player: Player;
    private logger: Logger;

    constructor(player: Player, logger: Logger) {
        this.player = player;
        this.logger = logger;
    }

    attack(victim: GameEntity, attackType: AttackTypeEnum) {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                //we need to verify the battle type before to do this
                this.meleeAttack(victim);
                break;

            default:
                this.logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    calcAttackRating(victim: GameEntity) {
        const attackerRating = this.player.getAttackRating();
        const victimRating = victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }

    meleeAttack(victim: GameEntity) {
        const MAX_DISTANCE = 500;
        const distance = MathUtil.calcDistance(
            this.player.getPositionX(),
            this.player.getPositionY(),
            victim.getPositionX(),
            victim.getPositionY(),
        );

        if (distance > MAX_DISTANCE) {
            this.logger.info(`[PlayerBattle] Very far from the victim.`);
            return;
        }

        const weapon = this.player.getWeapon();

        if (weapon && weapon.geType() === ItemTypeEnum.WEAPON) {
            switch (weapon.getSubType()) {
                case ItemSubTypeEnum.SWORD:
                case ItemSubTypeEnum.DAGGER:
                case ItemSubTypeEnum.TWO_HANDED:
                case ItemSubTypeEnum.BELL:
                case ItemSubTypeEnum.FAN:
                case ItemSubTypeEnum.MOUNT_SPEAR:
                    break;
                case ItemSubTypeEnum.BOW:
                    this.logger.info(`[PlayerBattle] Melee attack cant handle bow attacks.`);
                    return;
                default:
                    this.logger.info(`[PlayerBattle] Invalid weapon subtype: ${weapon.getSubType()}.`);
                    return;
            }
        }

        const attackRating = this.calcAttackRating(victim);

        //calculate attack for polymorph character

        const basePlayerAttack = this.player.getAttack();

        const attack = Math.floor(basePlayerAttack * attackRating);

        //apply affects: poison, stun, slow, fire
        //calculate bonus damage: mob (monster, animals, trees, demons etc)
        //calculate bonus damage: player (humanoids, races)

        const defense = victim.getDefense();

        const damage = Math.max(0, attack - defense);

        this.player.chat({
            message: `your damage is: ${damage}`,
            messageType: ChatMessageTypeEnum.NORMAL,
        });

        victim.takeDamage(this.player, damage);
    }
}
