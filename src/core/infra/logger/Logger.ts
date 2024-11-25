import { createLogger, format, transports, Logger } from 'winston';

const logger: Logger = createLogger({
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

export default () => {
    return logger;
};
