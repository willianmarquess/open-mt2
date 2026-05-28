import Connection from '@/core/interface/networking/Connection';
export default abstract class PacketHandler<T> {
    abstract execute(connection: Connection, packet: T): Promise<void>;
}
