import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';

export default class ServerStatusRequestPacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.SERVER_STATUS_REQUEST,
            name: 'ServerStatusRequestPacket',
            size: 10,
        });
    }

    unpack() {
        return this;
    }
}
