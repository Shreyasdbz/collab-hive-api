import pino from 'pino';
import loggingConfig from '@config/logging.config';

const logger = pino({
    level: loggingConfig.level,
    transport: loggingConfig.prettyPrint
        ? {
              target: 'pino-pretty',
              options: {
                  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                  colorize: true,
              },
          }
        : undefined,
});

export default logger;
