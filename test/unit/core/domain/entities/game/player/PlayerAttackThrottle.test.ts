import { expect } from 'chai';
import sinon from 'sinon';
import Player from '@/core/domain/entities/game/player/Player';
import Character from '@/core/domain/entities/game/Character';
import AffectBitFlag from '@/core/util/AffectBitFlag';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
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
        attacker.affectBitFlag = new AffectBitFlag();
        attacker.updateView = sinon.spy();
        attacker.setPos = sinon.spy();
        attacker.onMove = sinon.spy();
        attacker.horse = { isTemporaryRiding: () => false };
        attacker.battle = { attack: sinon.spy() };
        return attacker;
    };

    afterEach(() => sinon.restore());

    const landedHits = (attacker: any) => attacker.battle.attack.callCount;

    it('should reject a normal attack while stunned (issue #254)', () => {
        const attacker = createAttacker();
        attacker.setAffectFlag(AffectBitsTypeEnum.STUN);

        attacker.attack(AttackTypeEnum.NORMAL, createVictim(1));

        expect(landedHits(attacker)).to.equal(0);
    });

    it('should reject stun before consuming cooldown or changing combat and movement state', () => {
        const attacker = createAttacker();
        const victim = createVictim(1);
        attacker.lastTimeInBattle = 123;
        attacker.setAffectFlag(AffectBitsTypeEnum.STUN);
        const recordAttack = sinon.spy(victim, 'recordAttackedBy');

        attacker.attack(AttackTypeEnum.NORMAL, victim);

        expect(attacker.lastAttackVictimVid).to.equal(0);
        expect(attacker.lastAttackTime).to.equal(0);
        expect(attacker.lastTimeInBattle).to.equal(123);
        expect(recordAttack.called).to.be.false;
        expect(attacker.setPos.called).to.be.false;
        expect(attacker.onMove.called).to.be.false;
    });

    it('should allow an immediate attack after stun removal without a rejected hit consuming cooldown', () => {
        const attacker = createAttacker();
        const victim = createVictim(1);
        sinon.stub(performance, 'now').returns(10_000);
        attacker.setAffectFlag(AffectBitsTypeEnum.STUN);
        attacker.attack(AttackTypeEnum.NORMAL, victim);
        expect(landedHits(attacker)).to.equal(0);

        attacker.removeStun();
        attacker.attack(AttackTypeEnum.NORMAL, victim);

        expect(landedHits(attacker)).to.equal(1);
    });

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
