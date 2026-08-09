import HorseLevelCommandValidator from '@/game/domain/command/command/horseLevel/HorseLevelCommandValidator';
import { HORSE_MAX_LEVEL } from '@/core/domain/entities/game/horse/HorseStats';
import { expect } from 'chai';
import sinon from 'sinon';

describe('HorseLevelCommandValidator (issue #205)', () => {
    let commandValidator: HorseLevelCommandValidator;
    let commandMock: any;

    beforeEach(() => {
        commandMock = { getArgs: sinon.stub() };
        commandValidator = new HorseLevelCommandValidator(commandMock);
    });

    it('accepts a level inside the horse range', () => {
        commandMock.getArgs.returns(['playerName', 10]);

        commandValidator.build();

        expect(commandValidator.getErrors()).to.have.lengthOf(0);
    });

    for (const [name, level] of [
        ['negative', -1],
        ['above the horse cap', HORSE_MAX_LEVEL + 1],
    ] as const) {
        it(`refuses a ${name} level instead of silently clamping it`, () => {
            commandMock.getArgs.returns(['playerName', level]);

            commandValidator.build();
            const errors = commandValidator.getErrors();

            expect(errors).to.have.lengthOf(1);
            expect(errors[0].errors).to.deep.equal([{ error: `level value must be between 0 and ${HORSE_MAX_LEVEL}` }]);
        });
    }
});
