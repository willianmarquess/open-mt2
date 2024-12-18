import Connection from '@/core/interface/networking/Connection';
import Packet from '@/core/interface/networking/packets/packet/Packet';

export default abstract class PacketHandler<T extends Packet> {
    abstract execute(connection: Connection, packet: T): Promise<void>;
}