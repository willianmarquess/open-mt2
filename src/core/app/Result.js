export default class Result {
    #data;
    #error;

    constructor({ data, error }) {
        this.#data = data;
        this.#error = error;
    }

    get data() {
        return this.#data;
    }
    get error() {
        return this.#error;
    }

    static ok(data) {
        return new Result({ data });
    }

    static error(error) {
        return new Result({ error });
    }

    isOk() {
        return !!this.data;
    }

    hasError() {
        return !this.isOk() && !!this.error;
    }
}
