import { expect } from 'chai';
import sinon from 'sinon';
import Behavior from '@/core/domain/entities/game/mob/behavior/Behavior';
import Player from '@/core/domain/entities/game/player/Player';

const player = (id: number) => ({ getVirtualId: () => id }) as Player;

const setup = (initialTarget?: Player, group?: { triggerAll: sinon.SinonSpy }) => {
    let target = initialTarget;
    const monster = {
        getTarget: () => target,
        setTarget: sinon.spy((next: Player) => {
            target = next;
        }),
        getGroup: () => group,
    };
    return { monster, behavior: new Behavior(monster as any) };
};

describe('Behavior damage-based targeting (issue #253)', () => {
    it('should select the first attacker when there is no target', () => {
        const { monster, behavior } = setup();
        const attacker = player(1);

        behavior.onDamage(attacker, 10);

        expect(monster.getTarget()).to.equal(attacker);
        expect([...behavior.getAttackers()]).to.deep.equal([{ player: attacker, damage: 10 }]);
    });

    it('should switch to the attacker with higher accumulated damage', () => {
        const { monster, behavior } = setup();
        const first = player(1);
        const second = player(2);
        behavior.onDamage(first, 10);
        behavior.onDamage(second, 6);
        expect(monster.getTarget()).to.equal(first);

        behavior.onDamage(second, 5);

        expect(monster.getTarget()).to.equal(second);
        expect([...behavior.getAttackers()]).to.deep.equal([
            { player: first, damage: 10 },
            { player: second, damage: 11 },
        ]);
        expect(behavior.getAttackersSize()).to.equal(2);
    });

    it('should keep the current target when another attacker ties its damage', () => {
        const { monster, behavior } = setup();
        const first = player(1);
        behavior.onDamage(first, 10);

        behavior.onDamage(player(2), 10);

        expect(monster.getTarget()).to.equal(first);
        expect(monster.setTarget.calledOnce).to.equal(true);
    });

    it('should switch back when the previous target overtakes the new target', () => {
        const { monster, behavior } = setup();
        const first = player(1);
        const second = player(2);
        behavior.onDamage(first, 10);
        behavior.onDamage(second, 11);
        expect(monster.getTarget()).to.equal(second);

        behavior.onDamage(first, 2);

        expect(monster.getTarget()).to.equal(first);
    });

    it('should treat a target without recorded damage as having zero damage', () => {
        const { monster, behavior } = setup(player(1));
        const attacker = player(2);

        behavior.onDamage(attacker, 1);

        expect(monster.getTarget()).to.equal(attacker);
    });

    it('should still notify the group on each hit', () => {
        const group = { triggerAll: sinon.spy() };
        const { behavior } = setup(undefined, group);
        const first = player(1);
        const second = player(2);

        behavior.onDamage(first, 10);
        behavior.onDamage(second, 5);

        expect(group.triggerAll.args).to.deep.equal([[first], [second]]);
    });
});
