export default class Result<T, E> {
    private readonly data?: T;
    private readonly error?: E;

    private constructor({ data, error }: { data?: T; error?: E }) {
        this.data = data;
        this.error = error;
    }

    getData() {
        return this.data;
    }

    getError() {
        return this.error;
    }

    static ok<T, E>(data?: T) {
        return new Result<T, E>({ data });
    }

    static error<T, E>(error: E) {
        return new Result<T, E>({ error });
    }

    isOk() {
        return !this.hasError();
    }

    hasError() {
        return !!this.error;
    }
}
