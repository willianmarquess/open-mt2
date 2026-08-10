import { expect } from 'chai';
import sinon from 'sinon';

import UserHorseRideCommandHandler from '@/game/domain/command/command/userHorseRide/UserHorseRideCommandHandler';
import UserHorseBackCommandHandler from '@/game/domain/command/command/userHorseBack/UserHorseBackCommandHandler';
import UserHorseRideCommand from '@/game/domain/command/command/userHorseRide/UserHorseRideCommand';
import UserHorseBackCommand from '@/game/domain/command/command/userHorseBack/UserHorseBackCommand';
import Player from '@/core/domain/entities/game/player/Player';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';

/**
 * The original registers both commands as GM_PLAYER and each handler acts on
 * `ch` alone — do_user_horse_ride / do_user_horse_back take no argument at all
 * (cmd.cpp:463-464, cmd_general.cpp:42,73).
 */
const createPlayer = (overrides: Record<string, unknown> = {}) =>
    ({
        getName: () => 'Victim',
        toggleRiding: sinon.spy(),
        sendHorseAway: sinon.stub().returns(true),
        chat: sinon.spy(),
        sendCommandErrors: sinon.spy(),
        ...overrides,
    }) as unknown as Player;

describe('horse commands act on the caller only (issue #234)', () => {
    describe('/user_horse_ride', () => {
        it('mounts the caller when a target name is supplied', async () => {
            const caller = createPlayer({ getName: () => 'Attacker' });
            const handler = new UserHorseRideCommandHandler();

            await handler.execute(caller, new UserHorseRideCommand({ args: ['Victim'] }));

            expect((caller.toggleRiding as sinon.SinonSpy).calledOnce, 'the caller is the only target').to.equal(true);
        });

        it('exposes no target in its usage, so the argument cannot be advertised', () => {
            expect(UserHorseRideCommand.getExample()).to.equal('/user_horse_ride');
        });
    });

    describe('/user_horse_back', () => {
        it('sends the caller own horse away when a target name is supplied', async () => {
            const caller = createPlayer({ getName: () => 'Attacker' });
            const handler = new UserHorseBackCommandHandler({ logger: { debug: sinon.spy() } as never });

            await handler.execute(caller, new UserHorseBackCommand({ args: ['Victim'] }));

            expect((caller.sendHorseAway as sinon.SinonStub).calledOnce, 'the caller is the only target').to.equal(
                true,
            );
        });
    });
});

describe('mounting is refused while dead or stunned (issue #234)', () => {
    const buildPlayer = (state: { dead: boolean; stunned: boolean }) => {
        const player = Object.create(Player.prototype);

        player.isDead = () => state.dead;
        player.isAffectByFlag = (flag: AffectBitsTypeEnum) => flag === AffectBitsTypeEnum.STUN && state.stunned;
        player.isHorseRiding = () => false;
        player.startRiding = sinon.spy();
        player.stopRiding = sinon.spy();

        return player;
    };

    it('refuses to mount a dead player, as do_ride does', () => {
        const player = buildPlayer({ dead: true, stunned: false });

        player.toggleRiding();

        expect(player.startRiding.called, 'a corpse must not mount').to.equal(false);
    });

    it('refuses to mount a stunned player, as do_ride does', () => {
        const player = buildPlayer({ dead: false, stunned: true });

        player.toggleRiding();

        expect(player.startRiding.called, 'a stunned player must not mount').to.equal(false);
    });

    it('still mounts a healthy player', () => {
        const player = buildPlayer({ dead: false, stunned: false });

        player.toggleRiding();

        expect(player.startRiding.calledOnce, 'the ordinary path must survive the guard').to.equal(true);
    });
});
