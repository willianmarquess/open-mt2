export default class Ip {
    static toInt(ip: string) {
        const parts = ip.split('.');
        let res = 0;

        res += Number.parseInt(parts[3], 10) << 24;
        res += Number.parseInt(parts[2], 10) << 16;
        res += Number.parseInt(parts[1], 10) << 8;
        res += Number.parseInt(parts[0], 10);

        return res;
    }
}
