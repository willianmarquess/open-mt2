export default class Ip {
    static toInt(ip) {
        var parts = ip.split('.');
        var res = 0;

        res += parseInt(parts[3], 10) << 24;
        res += parseInt(parts[2], 10) << 16;
        res += parseInt(parts[1], 10) << 8;
        res += parseInt(parts[0], 10);

        return res;
    }
}
