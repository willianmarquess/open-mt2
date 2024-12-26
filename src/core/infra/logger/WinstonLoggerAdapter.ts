import winston from 'winston';
import Logger from '@/core/infra/logger/Logger';

export default class WinstonLoggerAdapter implements Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({
                    stack: true,
                }),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),
                new winston.transports.File({
                    filename: 'logs/info.log',
                    level: 'info',
                }),
                new winston.transports.Console(),
            ],
        });
    }

    info(message: string, ...params: any): void {
        this.logger.info(message, params);
    }
    error(param: Error | string, ...params: any): void {
        if (param instanceof Error) {
            this.logger.error(param);
            return;
        }

        this.logger.error(param as string, params);
    }
    debug(message: string, ...params: any): void {
        this.logger.debug(message, params);
    }
}
