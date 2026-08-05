import Monster from '@/core/domain/entities/game/mob/Monster';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import ChatService from '@/game/app/service/ChatService';
import { expect } from 'chai';
import sinon from 'sinon';

const RED = 1;
const BLUE = 2;

const makePlayer = ({ name = 'Someone', vid = 1, empire = RED } = {}) => {
    const player = sinon.createStubInstance(Player);
    player.getName.returns(name);
    player.getVirtualId.returns(vid);
    player.getEmpire.returns(empire);
    player.getNearbyEntities.returns(new Map());
    return player;
};

const nearby = (...entities: Array<{ getVirtualId: () => number }>) =>
    new Map(entities.map((entity) => [entity.getVirtualId(), entity]));

describe('ChatService', function () {
    let worldMock: any;
    let chatService: ChatService;

    beforeEach(function () {
        worldMock = {
            getPlayers: sinon.stub().returns(new Map()),
        };

        chatService = new ChatService({ world: worldMock });
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('talk', function () {
        it('should send the message to the speaker so they see their own line', function () {
            const speaker = makePlayer({ name: 'Speaker', vid: 7 });

            chatService.talk(speaker as unknown as Player, 'hello');

            expect(speaker.chat.calledOnce).to.be.true;
            expect(speaker.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'Speaker : hello',
            });
        });

        it('should relay the message to nearby players under the speaker vid', function () {
            const speaker = makePlayer({ name: 'Speaker', vid: 7, empire: BLUE });
            const listener = makePlayer({ name: 'Listener', vid: 8 });
            speaker.getNearbyEntities.returns(nearby(listener) as any);

            chatService.talk(speaker as unknown as Player, 'hello');

            expect(listener.chat.calledOnce).to.be.true;
            expect(listener.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'Speaker : hello',
                vid: 7,
                empireId: BLUE,
            });
        });

        it('should skip nearby entities that are not players', function () {
            const speaker = makePlayer({ vid: 7 });
            const monster = sinon.createStubInstance(Monster);
            monster.getVirtualId.returns(9);
            speaker.getNearbyEntities.returns(nearby(monster) as any);

            expect(() => chatService.talk(speaker as unknown as Player, 'hello')).to.not.throw();
            expect(speaker.chat.calledOnce, 'only the speaker was written to').to.be.true;
        });

        it('should cut a message down to the length the original allows', function () {
            const speaker = makePlayer({ name: 'Speaker', vid: 7 });
            const listener = makePlayer({ name: 'Listener', vid: 8 });
            speaker.getNearbyEntities.returns(nearby(listener) as any);

            chatService.talk(speaker as unknown as Player, 'x'.repeat(5000));

            const { message } = listener.chat.firstCall.args[0];
            expect(message.length).to.equal('Speaker : '.length + 485);
        });
    });

    describe('shout', function () {
        it('should reach every player of the same empire, the shouter included', function () {
            const shouter = makePlayer({ name: 'Shouter', vid: 7, empire: RED });
            const sameEmpire = makePlayer({ name: 'Ally', vid: 8, empire: RED });
            worldMock.getPlayers.returns(
                new Map([
                    ['Shouter', shouter],
                    ['Ally', sameEmpire],
                ]),
            );

            chatService.shout(shouter as unknown as Player, 'hello');

            expect(shouter.chat.calledOnce).to.be.true;
            expect(sameEmpire.chat.calledOnce).to.be.true;
            expect(sameEmpire.chat.firstCall.args[0].message).to.equal('Shouter : hello');
        });

        it('should not reach a player of another empire', function () {
            const shouter = makePlayer({ name: 'Shouter', vid: 7, empire: RED });
            const otherEmpire = makePlayer({ name: 'Stranger', vid: 8, empire: BLUE });
            worldMock.getPlayers.returns(new Map([['Stranger', otherEmpire]]));

            chatService.shout(shouter as unknown as Player, 'hello');

            expect(otherEmpire.chat.called).to.be.false;
        });

        it('should carry no speaker vid, which is what makes it visible off screen', function () {
            const shouter = makePlayer({ name: 'Shouter', vid: 7, empire: RED });
            worldMock.getPlayers.returns(new Map([['Shouter', shouter]]));

            chatService.shout(shouter as unknown as Player, 'hello');

            expect(shouter.chat.firstCall.args[0]).to.deep.equal({
                messageType: ChatMessageTypeEnum.SHOUT,
                message: 'Shouter : hello',
                vid: 0,
            });
        });
    });
});
