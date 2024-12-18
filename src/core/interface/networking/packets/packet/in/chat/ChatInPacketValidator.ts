import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import PacketValidator from '../../../PacketValidator';
import ChatInPacket from './ChatInPacket';

export default class ChatInPacketValidator extends PacketValidator<ChatInPacket> {
    build() {
        this.createRule(this.packet.getMessageType(), 'messageType')
            .isRequired()
            .isNumber()
            .isInEnum(Object.values(ChatMessageTypeEnum))
            .build();
        this.createRule(this.packet.getMessage(), 'message').isRequired().isString().build();
    }
}
