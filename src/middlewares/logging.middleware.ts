import pinoHttp from 'pino-http';
import logger from '@utils/logging.util';

const requestLogger = pinoHttp({
    logger, // Reuse the logger instance
    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                auth: req.headers['authorization'],
                correlationId: req.headers['correlation-id'],
                sessionId: req.headers['session-id'],
                params: req.params,
                body: req.body,
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});

export default requestLogger;
