export default class MathUtil {
    static #max_uint = 1e9;

    static get MAX_UINT() {
        return this.#max_uint;
    }

    static calcDistance(x1, y1, x2, y2) {
        const a = x1 - x2;
        const b = y1 - y2;

        return Math.sqrt(a * a + b * b);
    }

    static toUnsignedNumber(value) {
        const isValidNumber = !isNaN(parseFloat(value)) && isFinite(value) && Number(value) > 0;
        return isValidNumber ? Number(value) : 0;
    }
}
