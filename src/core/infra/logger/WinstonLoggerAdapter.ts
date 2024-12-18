import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import Logger from '@/core/infra/logger/Logger';

export default class WinstonLoggerAdapter implements Logger {
    private logger: WinstonLogger;

    constructor() {
        this.logger = createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: format.combine(
                format.timestamp(),
                format.errors({
                    stack: true,
                }),
                format.json(),
            ),
            transports: [
                new transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),
                new transports.File({
                    filename: 'logs/info.log',
                    level: 'info',
                }),
                new transports.Console(),
            ],
        });
    }

    info(message: string, ...params: any): void {
        this.logger.info(message, params);
    }
    error(param: Error | string, ...params: any): void {
        if (param instanceof Error) {
            this.logger.error(param);
        }

        this.logger.error(param as string, params);
    }
    debug(message: string, ...params: any): void {
        this.logger.debug(message, params);
    }
}
