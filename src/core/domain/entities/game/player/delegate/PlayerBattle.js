import AttackTypeEnum from '../../../../../enum/AttackTypeEnum';
import ChatMessageTypeEnum from '../../../../../enum/ChatMessageTypeEnum';
import ItemSubTypeEnum from '../../../../../enum/ItemSubTypeEnum';
import ItemTypeEnum from '../../../../../enum/ItemTypeEnum';
import MathUtil from '../../../../util/MathUtil';

export default class PlayerBattle {
    #player;
    #logger;

    constructor(player, logger) {
        this.#player = player;
        this.#logger = logger;
    }

    attack(victim, attackType) {
        switch (attackType) {
            case AttackTypeEnum.NORMAL:
                //we need to verify the battle type before to do this
                this.#meleeAttack(victim);
                break;

            default:
                this.#logger.info(`[PlayerBattle] Attack ${attackType} not implemented yet.`);
                break;
        }
    }

    #calcAttackRating(victim) {
        const attackerRating = this.#player.getAttackRating();
        const victimRating = victim.getAttackRating();
        const attackRating =
            (attackerRating + 210.0) / 300.0 - (((victimRating * 2 + 5) / (victimRating + 95)) * 3.0) / 10.0;
        return attackRating;
    }

    #meleeAttack(victim) {
        const MAX_DISTANCE = 300;
        const distance = MathUtil.calcDistance(
            this.#player.positionX,
            this.#player.positionY,
            victim.positionX,
            victim.positionY,
        );

        if (distance > MAX_DISTANCE) {
            this.#logger.info(`[PlayerBattle] Very far from the victim.`);
            return;
        }

        const weapon = this.#player.getWeapon();

        if (weapon && weapon.type === ItemTypeEnum.WEAPON) {
            switch (weapon.subType) {
                case ItemSubTypeEnum.SWORD:
                case ItemSubTypeEnum.DAGGER:
                case ItemSubTypeEnum.TWO_HANDED:
                case ItemSubTypeEnum.BELL:
                case ItemSubTypeEnum.FAN:
                case ItemSubTypeEnum.MOUNT_SPEAR:
                    break;
                case ItemSubTypeEnum.BOW:
                    this.#logger.info(`[PlayerBattle] Melee attack cant handle bow attacks.`);
                    return;
                default:
                    this.#logger.info(`[PlayerBattle] Invalid weapon subtype: ${weapon.subType}.`);
                    return;
            }
        }

        const attackRating = this.#calcAttackRating(victim);

        //calculate attack for polymorph character

        const basePlayerAttack = this.#player.getAttack();

        let attack = Math.floor(basePlayerAttack * attackRating);

        this.#player.chat({
            message: `your damage is: ${attack}`,
            messageType: ChatMessageTypeEnum.NORMAL,
        });
    }
}
