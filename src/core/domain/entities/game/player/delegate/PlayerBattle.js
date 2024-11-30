import AttackTypeEnum from '../../../../../enum/AttackTypeEnum.js';
import ChatMessageTypeEnum from '../../../../../enum/ChatMessageTypeEnum.js';
import ItemSubTypeEnum from '../../../../../enum/ItemSubTypeEnum.js';
import ItemTypeEnum from '../../../../../enum/ItemTypeEnum.js';
import MathUtil from '../../../../util/MathUtil.js';

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
        const MAX_DISTANCE = 500;
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

        const attack = Math.floor(basePlayerAttack * attackRating);

        //apply affects: poison, stun, slow, fire
        //calculate bonus damage: mob (monster, animals, trees, demons etc)
        //calculate bonus damage: player (humanoids, races)

        const defense = victim.getDefense();

        const damage = Math.max(0, attack - defense);

        this.#player.chat({
            message: `your damage is: ${damage}`,
            messageType: ChatMessageTypeEnum.NORMAL,
        });

        victim.takeDamage(this.#player, damage);
    }
}
