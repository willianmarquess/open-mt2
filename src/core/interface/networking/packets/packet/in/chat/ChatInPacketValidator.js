import ChatMessageTypeEnum from '../../../../../../enum/ChatMessageTypeEnum.js';
import PacketValidator from '../../../PacketValidator.js';

export default class ChatInPacketValidator extends PacketValidator {
    constructor(chatInPacket) {
        super(chatInPacket);
    }

    build() {
        this.createRule(this.packet.messageType, 'messageType')
            .isRequired()
            .isNumber()
            .isInEnum(Object.values(ChatMessageTypeEnum))
            .build();
        this.createRule(this.packet.message, 'message').isRequired().isString().build();
    }
}
