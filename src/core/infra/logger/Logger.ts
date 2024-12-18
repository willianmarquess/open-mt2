export default interface Logger {
    info(message: string, ...params: any): void;
    error(param: Error | string, ...params: any): void;
    debug(message: string, ...params: any): void;
}