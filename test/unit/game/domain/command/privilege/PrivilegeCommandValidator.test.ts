import PrivilegeCommandValidator from '@/game/domain/command/command/privilege/PrivilegeCommandValidator';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PrivilegeCommandValidator', () => {
    let commandValidator: PrivilegeCommandValidator;
    let commandMock: any;

    beforeEach(() => {
        commandMock = {
            getArgs: sinon.stub(),
        };
        commandValidator = new PrivilegeCommandValidator(commandMock);
    });

    it('should validate successfully with valid arguments', () => {
        commandMock.getArgs.returns(['player', 'playerName', 'gold', 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(0);
    });

    it("should fail if 'kind' is missing", () => {
        commandMock.getArgs.returns([undefined, 'playerName', 'gold', 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'kind',
                value: undefined,
                errors: [
                    { error: 'kind is required' },
                    { error: 'kind must be a string' },
                    { error: 'kind value must be one of (player, empire, guild)' },
                ],
            },
        ]);
    });

    it("should fail if 'kind' is not in the enum", () => {
        commandMock.getArgs.returns(['invalidKind', 'playerName', 'gold', 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'kind',
                value: 'invalidKind',
                errors: [{ error: 'kind value must be one of (player, empire, guild)' }],
            },
        ]);
    });

    it("should fail if 'playerName, empireName, guildName' is missing", () => {
        commandMock.getArgs.returns(['player', undefined, 'gold', 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'playerName, empireName, guildName',
                value: undefined,
                errors: [
                    { error: 'playerName, empireName, guildName is required' },
                    { error: 'playerName, empireName, guildName must be a string' },
                ],
            },
        ]);
    });

    it("should fail if 'type' is missing", () => {
        commandMock.getArgs.returns(['player', 'playerName', undefined, 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'type',
                value: undefined,
                errors: [
                    { error: 'type is required' },
                    { error: 'type must be a string' },
                    { error: 'type value must be one of (gold, drop, gold5, gold10, gold50)' },
                ],
            },
        ]);
    });

    it("should fail if 'type' is not in the enum", () => {
        commandMock.getArgs.returns(['player', 'playerName', 'invalidType', 5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'type',
                value: 'invalidType',
                errors: [{ error: 'type value must be one of (gold, drop, gold5, gold10, gold50)' }],
            },
        ]);
    });

    it("should fail if 'value' is missing", () => {
        commandMock.getArgs.returns(['player', 'playerName', 'gold', undefined, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'value',
                value: undefined,
                errors: [
                    { error: 'value is required' },
                    { error: 'value must be a number' },
                    { error: 'value value must be greater than 0' },
                ],
            },
        ]);
    });

    it("should fail if 'value' is not a number or less than 1", () => {
        commandMock.getArgs.returns(['player', 'playerName', 'gold', -5, 3600]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'value',
                value: -5,
                errors: [{ error: 'value value must be greater than 0' }],
            },
        ]);
    });

    it("should fail if 'timeInSeconds' is missing", () => {
        commandMock.getArgs.returns(['player', 'playerName', 'gold', 5, undefined]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'timeInSeconds',
                value: undefined,
                errors: [
                    { error: 'timeInSeconds is required' },
                    { error: 'timeInSeconds must be a number' },
                    { error: 'timeInSeconds value must be greater than 0' },
                ],
            },
        ]);
    });

    it("should fail if 'timeInSeconds' is not a number or less than 1", () => {
        commandMock.getArgs.returns(['player', 'playerName', 'gold', 5, 0]);

        commandValidator.build();
        const result = commandValidator.getErrors();

        expect(result.length).to.be.equal(1);
        expect(result).to.be.deep.equal([
            {
                name: 'timeInSeconds',
                value: 0,
                errors: [{ error: 'timeInSeconds value must be greater than 0' }],
            },
        ]);
    });
});
