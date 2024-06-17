import PacketHeaderEnum from '../../../../../enum/PacketHeaderEnum.js';
import PacketIn from './PacketIn.js';

export default class EnterGamePacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.ENTER_GAME,
            name: 'EnterGamePacket',
            size: 0,
        });
    }

    unpack() {
        return this;
    }
}
