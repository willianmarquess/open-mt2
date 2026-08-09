import { HORSE_MAX_LEVEL } from '@/core/domain/entities/game/horse/HorseStats';
import CommandValidator from '../../CommandValidator';

export default class HorseLevelCommandValidator extends CommandValidator {
    build() {
        this.createRule(this.command.getArgs()[0], 'name').isString().build();
        this.createRule(this.command.getArgs()[1], 'level').isNumber().isBetween(0, HORSE_MAX_LEVEL).build();
    }
}
