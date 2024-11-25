export default class Result {
  private constructor(
    private readonly data: Nullable<any>,
    private readonly error: Nullable<any>,
  ) {}

  static ok(data: any) {
    return new Result(data, null);
  }

  static error(error: any) {
    return new Result(null, error);
  }

  isOk() {
    return !this.hasError();
  }

  hasError() {
    return !!this.error;
  }
}
