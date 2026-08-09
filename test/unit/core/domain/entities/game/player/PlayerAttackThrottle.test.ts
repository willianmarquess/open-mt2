import { expect } from 'chai';
import sinon from 'sinon';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';
import { PositionEnum } from '@/core/enum/PositionEnum';

/**
 * Regression for issue #101: the throttle only compared against the attacker's
 * own last victim, so alternating targets skipped the time check entirely and
 * the guard never rejected a packet. The original does a second, victim-side
 * check (battle.cpp:794) which is what closes rotation.
 */
describe('Player.attack throttle across rotating victims (issue #101)', () => {
    const ATTACKER_ID = 42;

    const createVictim = (virtualId: number) => {
        const victim = Object.create(Character.prototype);
        victim.lastAttackedById = 0;
        victim.lastAttackedTime = 0;
        victim.getVirtualId = () => virtualId;
        victim.isDead = () => false;
        return victim as Character;
    };

    const createAttacker = () => {
        const attacker = Object.create(Player.prototype);
        attacker.lastAttackVictimVid = 0;
        attacker.lastAttackTime = 0;
        attacker.getId = () => ATTACKER_ID;
        attacker.getAttackSpeed = () => 100;
        attacker.isDead = () => false;
        attacker.isStun = () => false;
        attacker.setPos = sinon.spy();
        attacker.onMove = sinon.spy();
        attacker.horse = { isTemporaryRiding: () => false };
        attacker.battle = { attack: sinon.spy() };
        return attacker;
    };

    const landedHits = (attacker: any) => attacker.battle.attack.callCount;

    it('should reject a second immediate hit on the same victim', () => {
        const attacker = createAttacker();
        const victim = createVictim(1);

        attacker.attack(PositionEnum.STANDING, victim);
        attacker.attack(PositionEnum.STANDING, victim);

        expect(landedHits(attacker)).to.equal(1);
    });

    it('should reject the second round when the attacker rotates between two victims', () => {
        const attacker = createAttacker();
        const first = createVictim(1);
        const second = createVictim(2);

        attacker.attack(PositionEnum.STANDING, first);
        attacker.attack(PositionEnum.STANDING, second);
        attacker.attack(PositionEnum.STANDING, first);
        attacker.attack(PositionEnum.STANDING, second);

        expect(landedHits(attacker), 'A,B are free; the second A,B round is inside the cooldown').to.equal(2);
    });

    it('should still allow the first hit on a fresh victim inside the cooldown', () => {
        const attacker = createAttacker();
        const first = createVictim(1);
        const second = createVictim(2);

        attacker.attack(PositionEnum.STANDING, first);
        attacker.attack(PositionEnum.STANDING, second);

        expect(landedHits(attacker), 'switching targets mid-swing is legal play in the original').to.equal(2);
    });

    it('should let a hit through once the cooldown has elapsed', () => {
        const attacker = createAttacker();
        const victim = createVictim(1);

        attacker.attack(PositionEnum.STANDING, victim);
        attacker.lastAttackTime -= 10_000;
        victim.recordAttackedBy(ATTACKER_ID, performance.now() - 10_000);

        attacker.attack(PositionEnum.STANDING, victim);

        expect(landedHits(attacker)).to.equal(2);
    });

    it('should not throttle two different attackers hitting the same victim', () => {
        const attackerOne = createAttacker();
        const attackerTwo = createAttacker();
        attackerTwo.getId = () => ATTACKER_ID + 1;
        const victim = createVictim(1);

        attackerOne.attack(PositionEnum.STANDING, victim);
        attackerTwo.attack(PositionEnum.STANDING, victim);

        expect(landedHits(attackerOne)).to.equal(1);
        expect(landedHits(attackerTwo), 'the victim log is keyed by attacker, as in the original').to.equal(1);
    });
});
