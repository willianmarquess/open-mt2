import { PacketHeaderEnum } from "@/core/enum/PacketHeaderEnum";
import PacketIn from "../PacketIn";

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
