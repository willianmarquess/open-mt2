import World from '@/core/domain/World';
import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';

const CHAT_MAX_LEN = 512;
const CHARACTER_NAME_MAX_LEN = 24;
const MESSAGE_MAX_LEN = CHAT_MAX_LEN - (CHARACTER_NAME_MAX_LEN + 3);
const NO_SPEAKER_VID = 0;

export default class ChatService {
    private readonly world: World;

    constructor({ world }: { world: World }) {
        this.world = world;
    }

    talk(speaker: Player, message: string) {
        const text = this.format(speaker, message);

        speaker.chat({ messageType: ChatMessageTypeEnum.NORMAL, message: text });

        for (const entity of speaker.getNearbyEntities().values()) {
            if (!(entity instanceof Player)) continue;

            entity.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: text,
                vid: speaker.getVirtualId(),
                empireId: speaker.getEmpire(),
            });
        }
    }

    shout(speaker: Player, message: string) {
        const text = this.format(speaker, message);

        for (const player of this.world.getPlayers().values()) {
            if (player.getEmpire() !== speaker.getEmpire()) continue;

            // A shout carries no speaker vid on purpose: the client resolves a
            // non-zero vid to a character instance and drops the message when
            // it has none, which is every receiver outside the shouter's view.
            player.chat({
                messageType: ChatMessageTypeEnum.SHOUT,
                message: text,
                vid: NO_SPEAKER_VID,
            });
        }
    }

    private format(speaker: Player, message: string) {
        return `${speaker.getName()} : ${message.slice(0, MESSAGE_MAX_LEN)}`.slice(0, CHAT_MAX_LEN);
    }
}
