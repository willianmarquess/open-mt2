import PacketHeaderEnum from '../../../../../../enum/PacketHeaderEnum.js';
import PacketIn from '../PacketIn.js';

export default class ServerStatusRequestPacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.SERVER_STATUS_REQUEST,
            name: 'ServerStatusRequestPacket',
            size: 10,
        });
    }

    unpack() {}
}
