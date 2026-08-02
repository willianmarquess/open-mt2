import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';

const MARK_LOGIN_SIZE = 9;

export default class MarkLoginPacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.MARK_LOGIN,
            name: 'MarkLoginPacket',
            size: MARK_LOGIN_SIZE,
            sequenced: false,
        });
    }

    unpack() {
        return this;
    }
}
